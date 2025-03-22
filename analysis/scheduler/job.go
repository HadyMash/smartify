package scheduler

import (
	"time"
)

// Job represents a scheduled task for a device
type Job struct {
	ID          string
	DeviceID    string
	StartTime   time.Time
	StopTime    *time.Time // Optional
	OriginalAction func()  // Original action to revert to
	CurrentAction  func()  // Can be overridden
}

// NewJob creates a new job instance
func NewJob(id string, deviceID string, start time.Time, stop *time.Time, action func()) *Job {
	return &Job{
		ID:             id,
		DeviceID:       deviceID,
		StartTime:      start,
		StopTime:       stop,
		OriginalAction: action,
		CurrentAction:  action,
	}
}

// Execute runs the job's current action
func (j *Job) Execute() {
	j.CurrentAction()
}