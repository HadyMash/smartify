package services

import (
    "context"
	"go.mongodb.org/mongo-driver/mongo"
)

type SecurityEvent struct {
    DeviceID string `json:"device_id"`
    Event    string `json:"event"`
    Time     string `json:"time"`
}

type SecurityService struct {
    DB *mongo.Database
}

func NewSecurityService(db *mongo.Database) *SecurityService {
    return &SecurityService{DB: db}
}

func (s *SecurityService) LogSecurityEvent(event SecurityEvent) error {
    collection := s.DB.Collection("security_events")
    _, err := collection.InsertOne(context.TODO(), event)
    return err
}