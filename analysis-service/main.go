package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
    "smart-home-analysis/handlers"
    "smart-home-analysis/services"
    "smart-home-analysis/utils"

    "github.com/joho/godotenv"
)

// App holds the services, handlers, and scheduler
type App struct {
    AnalysisHandler    *handlers.AnalysisHandler
    SecurityHandler    *handlers.SecurityHandler
    DeviceUsageHandler *handlers.DeviceUsageHandler
    LeaderboardHandler *handlers.LeaderboardHandler

}

// Initialize application services and handlers
func (app *App) Initialize() {
    // Load .env file
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    // Initialize MongoDB connection
    mongoURI := os.Getenv("MONGO_URI")
    utils.InitMongoClient(mongoURI)
    db := utils.GetDatabase("smartify")

    // Initialize services
    analysisService := services.NewAnalysisService(db)
    securityService := services.NewSecurityService(db)
    deviceUsageService := services.NewDeviceUsageService(db)
    leaderboardService := services.NewLeaderboardService(db)

    // Initialize handlers
    app.AnalysisHandler = handlers.NewAnalysisHandler(analysisService)
    app.SecurityHandler = handlers.NewSecurityHandler(securityService)
    app.DeviceUsageHandler = handlers.NewDeviceUsageHandler(deviceUsageService)
    app.LeaderboardHandler = handlers.NewLeaderboardHandler(leaderboardService)
    

    // Initialize the scheduler
    //app.SchedulerService = scheduler.NewScheduler()
}

// Register API routes
func (app *App) RegisterRoutes() {
    http.HandleFunc("/api/analyze", app.AnalysisHandler.PerformAnalysis)
    http.HandleFunc("/api/security/log", app.SecurityHandler.LogSecurityEvent)
    http.HandleFunc("/api/device/usage", app.DeviceUsageHandler.AnalyzeDeviceUsage)
    http.HandleFunc("/api/device/lifespan", app.DeviceUsageHandler.TrackDeviceLifespan)
    http.HandleFunc("/api/leaderboard", app.LeaderboardHandler.GetLeaderboard)
    http.HandleFunc("/api/statistics", app.LeaderboardHandler.GetStatistics)
    http.HandleFunc("/api/energy-generation", app.AnalysisHandler.GetEnergyGenerationSummary)
    webhookHandler := handlers.NewWebhookHandler()
    http.HandleFunc("/api/ingest", webhookHandler.HandleIngest)
}

// Run the server only if webhooks are needed
func (app *App) Run() {
    // Start the scheduler in parallel (non-blocking)
    //go app.SchedulerService.Start()

    if os.Getenv("ENABLE_WEBHOOKS") == "true" {
        fmt.Println("Webhook server running on port 8080...")
        log.Fatal(http.ListenAndServe(":8080", nil))
    } else {
        fmt.Println("Webhooks disabled. Server not started.")
    }
}

func main() {
    app := &App{}
    app.Initialize()
    app.RegisterRoutes()
    app.Run()
}