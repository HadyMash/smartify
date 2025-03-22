package scheduler

import (
	"context"
	"fmt"
	"log"
	"smart-home-analysis/utils"

	"go.mongodb.org/mongo-driver/bson"
)

// CommunicateToDevice tries to notify the device of its schedule
func CommunicateToDevice(deviceID string, canSelfSchedule bool) {
	if canSelfSchedule {
		fmt.Printf("[Device %s] Schedule sent to device to handle on its own.\n", deviceID)
	} else {
		fmt.Printf("[Device %s] Device cannot self-schedule. Backend will control the device directly.\n", deviceID)
		ControlDevice(deviceID)
	}
}

// ControlDevice simulates backend controlling the device directly
func ControlDevice(deviceID string) {
	fmt.Printf("[Device %s] Performing control action from backend.\n", deviceID)
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

	// Return a closure that performs the action (simulated)
	return func() {
		fmt.Printf("[Device %s] Executing action from DB: %s\n", result.DeviceID, result.Action)
	}
}