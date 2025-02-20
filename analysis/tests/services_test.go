package tests

import (
    "smart-home-analysis/services"
    "testing"
)

func TestAverage(t *testing.T) {
    data := []float64{1.0, 2.0, 3.0, 4.0, 5.0}
    result := services.Average(data)
    expected := 3.0	
    if result != expected {
        t.Errorf("Expected %f, got %f", expected, result)
    }
}

func TestMax(t *testing.T) {
    data := []float64{1.0, 2.0, 3.0, 4.0, 5.0}
    result := services.Max(data)
    expected := 5.0
    if result != expected {
        t.Errorf("Expected %f, got %f", expected, result)
    }
}

func TestMin(t *testing.T) {
    data := []float64{1.0, 2.0, 3.0, 4.0, 5.0}
    result := services.Min(data)
    expected := 1.0
    if result != expected {
        t.Errorf("Expected %f, got %f", expected, result)
    }
}

func TestStdDeviation(t *testing.T) {
    data := []float64{1.0, 2.0, 3.0, 4.0, 5.0}
    result := services.StdDeviation(data)
    expected := 1.4142135623730951 // Approximate value of std deviation
    if result != expected {
        t.Errorf("Expected %f, got %f", expected, result)
    }
}