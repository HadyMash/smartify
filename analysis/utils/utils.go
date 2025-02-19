package utils

import (
    "context"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "log"
)

// MongoClient will hold the MongoDB client
var MongoClient *mongo.Client

func InitMongoClient(uri string) {
    client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
    if err != nil {
        log.Fatalf("Error connecting to MongoDB: %v", err)
    }
    MongoClient = client
}

func GetDatabase(dbName string) *mongo.Database {
    return MongoClient.Database(dbName)
}