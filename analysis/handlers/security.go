package handlers

import (
    "encoding/json"
    "fmt"
    "net/http"
    "smart-home-analysis/services"
)

type SecurityHandler struct {
    SecurityService *services.SecurityService
}

func NewSecurityHandler(securityService *services.SecurityService) *SecurityHandler {
    return &SecurityHandler{SecurityService: securityService}
}

func (h *SecurityHandler) LogSecurityEvent(w http.ResponseWriter, r *http.Request) {
    var event services.SecurityEvent
    if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    err := h.SecurityService.LogSecurityEvent(event)
    if err != nil {
        http.Error(w, fmt.Sprintf("Error logging event: %v", err), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"message": "Event logged successfully"}`))
}