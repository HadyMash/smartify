package models

type DeviceData struct {
    DeviceID        string  `json:"device_id" bson:"device_id"`
    EnergyConsumed  float64 `json:"energy_consumed" bson:"energy_consumed"`
    Timestamp       int64   `json:"timestamp" bson:"timestamp"`
}

type AnalysisResult struct {
    AverageEnergy   float64 `json:"average_energy"`
    MaxEnergy       float64 `json:"max_energy"`
    MinEnergy       float64 `json:"min_energy"`
    StdDeviation    float64 `json:"std_deviation"`
}
//