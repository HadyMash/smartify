package tests

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "smart-home-analysis/handlers"
    "smart-home-analysis/services"
    "smart-home-analysis/utils"
    "testing"
)

func TestPerformAnalysis(t *testing.T) {
    // Initialize the MongoDB client
    utils.InitMongoClient("mongodb://localhost:27017")
    db := utils.GetDatabase("smart_home_db")

    // Create analysis service and handler
    analysisService := services.NewAnalysisService(db)
    analysisHandler := handlers.NewAnalysisHandler(analysisService)

    // Create a test server with the analysis handler
    server := httptest.NewServer(http.HandlerFunc(analysisHandler.PerformAnalysis))
    defer server.Close()

    // Simulate a POST request to the /api/analyze endpoint
    req, err := http.NewRequest(http.MethodPost, server.URL+"/api/analyze", nil)
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