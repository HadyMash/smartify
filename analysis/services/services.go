package services

import (
    "context"
    "fmt"
    "math"
    "smart-home-analysis/models"
    "sync"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
)

// AnalysisService handles all analysis tasks
type AnalysisService struct {
    db     *mongo.Database
    wg     sync.WaitGroup
    Result chan models.AnalysisResult
}

func NewAnalysisService(db *mongo.Database) *AnalysisService {
    return &AnalysisService{
        db:     db,
        Result: make(chan models.AnalysisResult),
    }
}

// PerformAnalysis fetches device data and performs analysis concurrently
func (s *AnalysisService) PerformAnalysis() {
    s.wg.Add(1)
    go s.fetchAndAnalyzeData()
    s.wg.Wait()
}

// fetchAndAnalyzeData fetches data from MongoDB and runs analysis
func (s *AnalysisService) fetchAndAnalyzeData() {
    defer s.wg.Done()

    collection := s.db.Collection("device_data")
    cursor, err := collection.Find(context.Background(), bson.M{})
    if err != nil {
        fmt.Println("Error fetching data:", err)
        return
    }
    defer cursor.Close(context.Background())

    var allDeviceData []models.DeviceData
    if err := cursor.All(context.Background(), &allDeviceData); err != nil {
        fmt.Println("Error reading cursor data:", err)
        return
    }

    energyData := make([]float64, len(allDeviceData))
    for i, data := range allDeviceData {
        energyData[i] = data.EnergyConsumed
    }

    // Perform analysis (e.g., average, max, std deviation)
    result := models.AnalysisResult{
        AverageEnergy:   Average(energyData),
        MaxEnergy:       Max(energyData),
        MinEnergy:       Min(energyData),
        StdDeviation:    StdDeviation(energyData),
    }

    s.Result <- result // Send result through channel
}

// average calculates the average of the energy consumption
func Average(data []float64) float64 {
    sum := 0.0
    for _, v := range data {
        sum += v
    }
    return sum / float64(len(data))
}

// max finds the max value in the data
func Max(data []float64) float64 {
    maxVal := data[0]
    for _, v := range data {
        if v > maxVal {
            maxVal = v
        }
    }
    return maxVal
}

// min finds the min value in the data
func Min(data []float64) float64 {
    minVal := data[0]
    for _, v := range data {
        if v < minVal {
            minVal = v
        }
    }
    return minVal
}

// stdDeviation calculates the standard deviation of the energy data
func StdDeviation(data []float64) float64 {
    mean := Average(data)
    var sum float64
    for _, v := range data {
        sum += math.Pow(v-mean, 2)
    }
    variance := sum / float64(len(data))
    return math.Sqrt(variance)
}