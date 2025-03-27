package usage

import (
	"context"
	"fmt"
	"log"
	"smart-home-analysis/utils"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

type DeviceLog struct {
	Timestamp time.Time       `bson:"timestamp"`
	DeviceID  string          `bson:"device_id"`
	Change    map[string]bool `bson:"change"` // e.g., {"on": true}
}

// AnalyzeDeviceUptime calculates total duration the device was ON
func AnalyzeDeviceUptime(deviceID string) (time.Duration, error) {
	db := utils.GetDatabase("smartify")
	collection := db.Collection("device_logs")

	filter := bson.M{"device_id": deviceID, "change.on": bson.M{"$exists": true}}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return 0, fmt.Errorf("error fetching logs: %v", err)
	}
	defer cursor.Close(context.TODO())

	var logs []DeviceLog
	if err := cursor.All(context.TODO(), &logs); err != nil {
		return 0, fmt.Errorf("error reading logs: %v", err)
	}

	// Sort logs by timestamp
	// MongoDB cursor usually returns sorted, but sort just in case
	for i := 1; i < len(logs); i++ {
		if logs[i].Timestamp.Before(logs[i-1].Timestamp) {
			logs[i], logs[i-1] = logs[i-1], logs[i] // simple swap
		}
	}

	var totalOnTime time.Duration
	var lastOnTime *time.Time

	for _, logEntry := range logs {
		isOn, ok := logEntry.Change["on"]
		if !ok {
			continue
		}

		if isOn {
			lastOnTime = &logEntry.Timestamp
		} else if lastOnTime != nil {
			duration := logEntry.Timestamp.Sub(*lastOnTime)
			totalOnTime += duration
			lastOnTime = nil
		}
	}

	// If still on at the end, count time till now
	if lastOnTime != nil {
		totalOnTime += time.Since(*lastOnTime)
	}

	return totalOnTime, nil
}

// GenerateUsageTip returns a suggestion based on device uptime
func GenerateUsageTip(deviceID string) string {
	uptime, err := AnalyzeDeviceUptime(deviceID)
	if err != nil {
		log.Printf("Failed to analyze %s: %v", deviceID, err)
		return "No usage data available."
	}

	hours := uptime.Hours()
	switch {
	case hours > 10:
		return fmt.Sprintf("Device has been on for %.1f hours. Consider turning it off when not needed.", hours)
	case hours > 5:
		return fmt.Sprintf("Device used moderately (%.1f hrs). Try reducing usage during peak hours.", hours)
	default:
		return fmt.Sprintf("Good job! Device was only used for %.1f hrs.", hours)
	}
}