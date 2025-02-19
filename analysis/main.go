package main

import (
    "fmt"
    "log"
    "net/http"
    "smart-home-analysis/handlers"
    "smart-home-analysis/services"
    "smart-home-analysis/utils"
)

func main() {
    // Initialize MongoDB connection
    utils.InitMongoClient("mongodb://localhost:27017")
    db := utils.GetDatabase("smart_home_db")  // Get the database

    // Create analysis service and pass the db
    analysisService := services.NewAnalysisService(db)  // Pass the database to the constructor

    // Create handler
    analysisHandler := handlers.NewAnalysisHandler(analysisService)

    // Register routes
    http.HandleFunc("/api/analyze", analysisHandler.PerformAnalysis)

    // Start the server
    fmt.Println("Server running on port 8080...")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal("Server failed: ", err)
    }
}