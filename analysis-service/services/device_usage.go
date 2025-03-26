package services

import (
	"go.mongodb.org/mongo-driver/mongo"
)

type DeviceUsageService struct{}

func NewDeviceUsageService(db *mongo.Database) *DeviceUsageService {
    return &DeviceUsageService{}
}

func (s *DeviceUsageService) AnalyzeUsage() map[string]string {
    return map[string]string{
        "lightbulb": "Consider using energy-efficient bulbs",
        "thermostat": "Lowering the temperature at night could save energy",
    }
}

func (s *DeviceUsageService) TrackLifespans() map[string]string {
    return map[string]string{
        "refrigerator": "Expected lifespan: 15 years",
        "washing_machine": "Expected lifespan: 10 years",
    }
}