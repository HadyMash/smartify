package scheduler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"smart-home-analysis/utils"

	"go.mongodb.org/mongo-driver/bson"
)

// CommunicateToDevice tries to notify the device of its schedule
func CommunicateToDevice(deviceID string, canSelfSchedule bool) {
	if canSelfSchedule {
		fmt.Printf("[Device %s] Schedule sent to device to handle on its own.\n", deviceID)
	} else {
		fmt.Printf("[Device %s] Device cannot self-schedule. Backend will control it.\n", deviceID)
		ControlDevice(deviceID)
	}
}

// ControlDevice mocks backend control by hitting a placeholder API endpoint
func ControlDevice(deviceID string) {
	payload := map[string]string{
		"device_id": deviceID,
		"action":    "activate",
	}
	jsonData, _ := json.Marshal(payload)

	apiHost := os.Getenv("API_HOST")
	if apiHost == "" {
		apiHost = "http://localhost:8080" // default fallback
	}

	resp, err := http.Post(apiHost+"/api/device/trigger", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("[Device %s] Failed to send control request: %v", deviceID, err)
		return
	}
	defer resp.Body.Close()

	log.Printf("[Device %s] Mock request sent to backend API. Status: %s", deviceID, resp.Status)
}

// FetchDeviceActionFromDB retrieves the latest action for the device from MongoDB
func FetchDeviceActionFromDB(deviceID string) func() {
	db := utils.GetDatabase("smartify")
	collection := db.Collection("device_actions")

	filter := bson.M{"device_id": deviceID}
	var result struct {
		DeviceID string `bson:"device_id"`
		Action   string `bson:"action"` // for simulation
	}
	err := collection.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		log.Printf("No action found for device %s: %v", deviceID, err)
		return func() {
			fmt.Printf("[Device %s] No specific action found in DB.\n", deviceID)
		}
	}

	// Return a closure that simulates making an API call instead of just printing
	return func() {
		payload := map[string]string{
			"device_id": result.DeviceID,
			"action":    result.Action,
		}
		jsonData, _ := json.Marshal(payload)

		apiHost := os.Getenv("API_HOST")
		if apiHost == "" {
			apiHost = "http://localhost:8080"
		}

		resp, err := http.Post(apiHost+"/api/device/trigger", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			log.Printf("[Device %s] Failed to perform action: %v", result.DeviceID, err)
			return
		}
		defer resp.Body.Close()

		log.Printf("[Device %s] Executed DB-defined action '%s' via mock API. Status: %s", result.DeviceID, result.Action, resp.Status)
	}
}