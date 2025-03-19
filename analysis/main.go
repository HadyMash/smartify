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
    db := utils.GetDatabase("smart_home_db") 

    // Create services
    analysisService := services.NewAnalysisService(db)
    securityService := services.NewSecurityService(db)
    deviceUsageService := services.NewDeviceUsageService(db)
    leaderboardService := services.NewLeaderboardService(db)

    // Create handlers
    analysisHandler := handlers.NewAnalysisHandler(analysisService)
    securityHandler := handlers.NewSecurityHandler(securityService)
    deviceUsageHandler := handlers.NewDeviceUsageHandler(deviceUsageService)
    leaderboardHandler := handlers.NewLeaderboardHandler(leaderboardService)

    // Register routes
    http.HandleFunc("/api/analyze", analysisHandler.PerformAnalysis)
    http.HandleFunc("/api/security/log", securityHandler.LogSecurityEvent)
    http.HandleFunc("/api/device/usage", deviceUsageHandler.AnalyzeDeviceUsage)
    http.HandleFunc("/api/device/lifespan", deviceUsageHandler.TrackDeviceLifespan)
    http.HandleFunc("/api/leaderboard", leaderboardHandler.GetLeaderboard)
    http.HandleFunc("/api/statistics", leaderboardHandler.GetStatistics)

    // Start the server
    fmt.Println("Server running on port 8080...")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal("Server failed: ", err)
    }
}