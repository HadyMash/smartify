package services

import (
	"context"
	"fmt"
	"math"
	"smart-home-analysis/models"
	"sync"
	"time"

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

// AnalyzeEnergyGeneration aggregates total and average energy generated per time window (e.g., hourly, daily)
func (s *AnalysisService) AnalyzeEnergyGeneration(window string) ([]map[string]interface{}, error) {
    collection := s.db.Collection("energy_generation_data")

    // Define aggregation pipeline
    pipeline := mongo.Pipeline{
        // Match all documents (can be extended with filters later)
        bson.D{{Key: "$match", Value: bson.D{}}},

        // Group by truncated timestamp (e.g., hourly or daily buckets)
        bson.D{{Key: "$group", Value: bson.D{
            {Key: "_id", Value: bson.D{
                {Key: "$dateTrunc", Value: bson.D{
                    {Key: "date", Value: "$timestamp"}, // Grouping based on timestamp field
                    {Key: "unit", Value: window},       // Unit like "hour", "day", etc.
                }},
            }},
            {Key: "totalGenerated", Value: bson.D{{Key: "$sum", Value: "$energy_value"}}}, // Sum of energy values
            {Key: "avgGenerated", Value: bson.D{{Key: "$avg", Value: "$energy_value"}}},   // Average of energy values
        }}},

        // Sort by timestamp ascending
        bson.D{{Key: "$sort", Value: bson.D{{Key: "_id", Value: 1}}}},
    }

    // Run the aggregation query
    cursor, err := collection.Aggregate(context.TODO(), pipeline)
    if err != nil {
        return nil, fmt.Errorf("aggregation error: %v", err)
    }
    defer cursor.Close(context.TODO())

    var results []map[string]interface{}

    // Iterate through aggregation results
    for cursor.Next(context.TODO()) {
        var doc struct {
            ID             time.Time `bson:"_id"`            // Truncated time bucket
            TotalGenerated float64   `bson:"totalGenerated"` // Total energy for the bucket
            AvgGenerated   float64   `bson:"avgGenerated"`   // Average energy for the bucket
        }

        if err := cursor.Decode(&doc); err != nil {
            return nil, err
        }

        // Add formatted result to the response slice
        results = append(results, map[string]interface{}{
            "timestamp":       doc.ID.Format(time.RFC3339),
            "total_generated": doc.TotalGenerated,
            "avg_generated":   doc.AvgGenerated,
        })
    }

    return results, nil
}