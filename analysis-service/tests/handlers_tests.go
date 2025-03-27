package tests

import (
    "context"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "smart-home-analysis/handlers"
    "smart-home-analysis/services"
    "smart-home-analysis/utils"
    "testing"
    "time"

    "go.mongodb.org/mongo-driver/bson"
)

// Setup test database with placeholder database
func setupTestDB() {
    utils.InitMongoClient("mongodb://localhost:27017")
    db := utils.GetDatabase("smartify_test_db")

    energyCollection := db.Collection("energy_usage")

    dummyData := []interface{}{
        bson.M{"timestamp": time.Now(), "energy": 10.5},
        bson.M{"timestamp": time.Now().Add(-time.Hour), "energy": 15.2},
        bson.M{"timestamp": time.Now().Add(-2 * time.Hour), "energy": 9.8},
        bson.M{"timestamp": time.Now().Add(-3 * time.Hour), "energy": 12.7},
    }

    _, err := energyCollection.InsertMany(context.TODO(), dummyData)
    if err != nil {
        panic("Failed to insert dummy data: " + err.Error())
    }
}

// Cleanup test database after test runs
func teardownTestDB() {
    db := utils.GetDatabase("smartify_test_db")
    db.Drop(context.TODO()) // Drop the test database
}

func TestPerformAnalysis(t *testing.T) {
    // Setup test database and load dummy data
    setupTestDB()
    defer teardownTestDB() // Cleanup after test

    db := utils.GetDatabase("smartify_test_db")

    // Create analysis service and handler
    analysisService := services.NewAnalysisService(db)
    analysisHandler := handlers.NewAnalysisHandler(analysisService)

    // Ensure analysis service is running in a goroutine
    go func() {
        for result := range analysisService.Result {
            t.Logf("Analysis Result: %+v", result)
        }
    }()

    // Create a test server with the analysis handler
    server := httptest.NewServer(http.HandlerFunc(analysisHandler.PerformAnalysis))
    defer server.Close()

    // Simulate a POST request to the /api/analyze endpoint
    req, err := http.NewRequest(http.MethodPost, server.URL, nil)
    if err != nil {
        t.Fatal(err)
    }

    // Perform the request
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        t.Fatal(err)
    }

    // Ensure the status code is OK (200)
    if resp.StatusCode != http.StatusOK {
        t.Errorf("Expected status OK, got %v", resp.Status)
    }

    // Decode the JSON response
    var result map[string]interface{}
    err = json.NewDecoder(resp.Body).Decode(&result)
    if err != nil {
        t.Fatal("Error decoding response:", err)
    }

    // Validate the response fields
    if result["average_energy"] == nil || result["max_energy"] == nil || result["min_energy"] == nil || result["std_deviation"] == nil {
        t.Errorf("Invalid analysis result: %v", result)
    }
}