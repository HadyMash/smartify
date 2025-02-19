package handlers

import (
    "encoding/json"
    "fmt"
    "net/http"
    "smart-home-analysis/services"
)

// AnalysisHandler handles HTTP requests for triggering the analysis
type AnalysisHandler struct {
    AnalysisService *services.AnalysisService
}

// NewAnalysisHandler creates a new handler instance
func NewAnalysisHandler(analysisService *services.AnalysisService) *AnalysisHandler {
    return &AnalysisHandler{
        AnalysisService: analysisService,
    }
}

// PerformAnalysis handles POST requests to trigger the analysis process
func (h *AnalysisHandler) PerformAnalysis(w http.ResponseWriter, r *http.Request) {
    // Trigger the analysis
    h.AnalysisService.PerformAnalysis()

    // Get the result from the service
    result := <-h.AnalysisService.Result

    // Return the result as a JSON response
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)

    response := map[string]interface{}{
        "average_energy": result.AverageEnergy,
        "max_energy":     result.MaxEnergy,
        "min_energy":     result.MinEnergy,
        "std_deviation":  result.StdDeviation,
    }

    err := json.NewEncoder(w).Encode(response)
    if err != nil {
        http.Error(w, fmt.Sprintf("Error encoding response: %v", err), http.StatusInternalServerError)
        return
    }
}