package services

import (
	"context"
	"log"
	"smart-home-analysis/services/usage"
	"smart-home-analysis/utils"

	"go.mongodb.org/mongo-driver/bson"
)

type DeviceUsageService struct{}

func NewDeviceUsageService(_ interface{}) *DeviceUsageService {
	return &DeviceUsageService{}
}

// AnalyzeUsage dynamically generates usage-based tips by analyzing all devices in logs
func (s *DeviceUsageService) AnalyzeUsage() map[string]string {
	db := utils.GetDatabase("smartify")
	collection := db.Collection("device_logs")

	// Distinct device IDs from logs
	deviceIDs, err := collection.Distinct(context.TODO(), "device_id", bson.M{})
	if err != nil {
		log.Printf("Error fetching distinct device IDs: %v", err)
		return map[string]string{"error": "Unable to generate tips"}
	}

	tips := make(map[string]string)
	for _, id := range deviceIDs {
		if deviceID, ok := id.(string); ok {
			tips[deviceID] = usage.GenerateUsageTip(deviceID)
		}
	}

	return tips
}

// TrackLifespans returns static estimates
func (s *DeviceUsageService) TrackLifespans() map[string]string {
	return map[string]string{
		"refrigerator":     "Expected lifespan: 15 years",
		"washing_machine":  "Expected lifespan: 10 years",
	}
}