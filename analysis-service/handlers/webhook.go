package handlers

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type WebhookHandler struct{}

func NewWebhookHandler() *WebhookHandler {
    return &WebhookHandler{}
}

func (h *WebhookHandler) HandleIngest(w http.ResponseWriter, r *http.Request) {
    fmt.Println("📩 Incoming request to /api/ingest") // DEBUG LOG

    var payload map[string]interface{}
    err := json.NewDecoder(r.Body).Decode(&payload)
    if err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    fmt.Println("✅ Webhook received payload:", payload)

    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status": "received"}`))
}
