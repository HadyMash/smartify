package handlers

import (
    "encoding/json"
    "net/http"
    "smart-home-analysis/services"
)

type DeviceUsageHandler struct {
    DeviceUsageService *services.DeviceUsageService
}

func NewDeviceUsageHandler(service *services.DeviceUsageService) *DeviceUsageHandler {
    return &DeviceUsageHandler{DeviceUsageService: service}
}

func (h *DeviceUsageHandler) AnalyzeDeviceUsage(w http.ResponseWriter, r *http.Request) {
    suggestions := h.DeviceUsageService.AnalyzeUsage()
    
    response, _ := json.Marshal(suggestions)
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write(response)
}

func (h *DeviceUsageHandler) TrackDeviceLifespan(w http.ResponseWriter, r *http.Request) {
    tracking := h.DeviceUsageService.TrackLifespans()
    
    response, _ := json.Marshal(tracking)
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write(response)
}