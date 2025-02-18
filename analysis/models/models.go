package models

import "time"

type DeviceData struct {
	DeviceID  string    `bson:"device_id"`
	Timestamp time.Time `bson:"timestamp"`
	Value     float64   `bson:"value"`
}

type AnalysisResult struct {
	DeviceID          string  `bson:"device_id"`
	AvgConsumption    float64 `bson:"avg_consumption"`
	MaxConsumption    float64 `bson:"max_consumption"`
	StdDevConsumption float64 `bson:"std_dev_consumption"`
}
