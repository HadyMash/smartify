package handlers

import (
    "encoding/json"
    "net/http"
    "smart-home-analysis/services"
)

type LeaderboardHandler struct {
    LeaderboardService *services.LeaderboardService
}

func NewLeaderboardHandler(service *services.LeaderboardService) *LeaderboardHandler {
    return &LeaderboardHandler{LeaderboardService: service}
}

func (h *LeaderboardHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
    leaderboard := h.LeaderboardService.GetLeaderboard()
    
    response, _ := json.Marshal(leaderboard)
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write(response)
}

func (h *LeaderboardHandler) GetStatistics(w http.ResponseWriter, r *http.Request) {
    stats := h.LeaderboardService.GetAnonymizedStatistics()

    response, _ := json.Marshal(stats)
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write(response)
}