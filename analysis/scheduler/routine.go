package scheduler

import "time"

// Routine represents a collection of grouped actions
type Routine struct {
	ID        string
	Name      string
	DeviceIDs []string
	StartTime time.Time
	StopTime  *time.Time
	Action    func() // Common action for all devices
}

// NewRoutine creates a new routine instance
func NewRoutine(id string, name string, deviceIDs []string, start time.Time, stop *time.Time, action func()) *Routine {
	return &Routine{
		ID:        id,
		Name:      name,
		DeviceIDs: deviceIDs,
		StartTime: start,
		StopTime:  stop,
		Action:    action,
	}
}