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

    if len(allDeviceData) == 0 {
        fmt.Println("Warning: No device data available for analysis")
        return
    }

    energyData := make([]float64, len(allDeviceData))
    for i, data := range allDeviceData {
        energyData[i] = data.EnergyConsumed
    }

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

// Max finds the max value in the data
func Max(values []float64) float64 {
    if len(values) == 0 {
        fmt.Println("Warning: Max called on empty slice")
        return 0 // Return a default value instead of panicking
    }
    
    maxVal := values[0]
    for _, v := range values {
        if v > maxVal {
            maxVal = v
        }
    }
    return maxVal
}

// Min finds the min value in the data
func Min(data []float64) float64 {
    if len(data) == 0 {
        fmt.Println("Warning: Min called on empty slice")
        return 0 // Return a default value
    }
    
    minVal := data[0]
    for _, v := range data {
        if v < minVal {
            minVal = v
        }
    }
    return minVal
}

// StdDeviation calculates the standard deviation of the energy data
func StdDeviation(data []float64) float64 {
    if len(data) == 0 {
        fmt.Println("Warning: StdDeviation called on empty slice")
        return 0 // Return a default value
    }

    mean := Average(data)
    var sum float64
    for _, v := range data {
        sum += math.Pow(v-mean, 2)
    }
    variance := sum / float64(len(data))
    return math.Sqrt(variance)
}