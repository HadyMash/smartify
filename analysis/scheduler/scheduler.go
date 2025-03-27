package scheduler

import (
    "fmt"
    "sync"
    "time"

    "github.com/go-co-op/gocron"
)

// Scheduler is the core scheduling service
type Scheduler struct {
    scheduler *gocron.Scheduler
    mu        sync.Mutex
    jobs      map[string]*Job
    routines  map[string]*Routine
}

// NewScheduler initializes and returns a scheduler instance
func NewScheduler() *Scheduler {
    return &Scheduler{
        scheduler: gocron.NewScheduler(time.UTC),
        jobs:      make(map[string]*Job),
        routines:  make(map[string]*Routine),
    }
}

// Start runs the scheduling loop in async mode
func (s *Scheduler) Start() {
    s.scheduler.StartAsync()
}

// Stop halts the scheduler
func (s *Scheduler) Stop() {
    s.scheduler.Stop()
}

// ScheduleJob sets up a job in gocron with optional self-scheduling
func (s *Scheduler) ScheduleJob(job *Job, canSelfSchedule bool) error {
    s.mu.Lock()
    defer s.mu.Unlock()

    if _, exists := s.jobs[job.ID]; exists {
        return fmt.Errorf("job already exists: %s", job.ID)
    }

    // Fetch the device action from DB
    dbAction := FetchDeviceActionFromDB(job.DeviceID)
    job.OriginalAction = dbAction
    job.CurrentAction = dbAction

    // Convert start time to HH:MM format
    startTime := job.StartTime.Format("15:04")
    _, err := s.scheduler.Tag(job.ID).At(startTime).Do(func() {
        CommunicateToDevice(job.DeviceID, canSelfSchedule)
        job.Execute()
    })
    if err != nil {
        return err
    }

    // If there's a stop time, schedule that too
    if job.StopTime != nil {
        stopStr := job.StopTime.Format("15:04")
        _, err = s.scheduler.Tag(job.ID + "_stop").At(stopStr).Do(func() {
            // Some custom logic, e.g., revert or turn off device
            fmt.Printf("[Job %s] Stopping device at %s.\n", job.ID, stopStr)
        })
        if err != nil {
            return err
        }
    }

    s.jobs[job.ID] = job
    return nil
}

// OverrideJob changes the job's current action with a user override
func (s *Scheduler) OverrideJob(jobID string, overrideAction func()) error {
    s.mu.Lock()
    defer s.mu.Unlock()

    job, exists := s.jobs[jobID]
    if !exists {
        return fmt.Errorf("job not found: %s", jobID)
    }

    job.CurrentAction = overrideAction
    return nil
}

// RevertJob resets a job's action to the original DB-defined action
func (s *Scheduler) RevertJob(jobID string) error {
    s.mu.Lock()
    defer s.mu.Unlock()

    job, exists := s.jobs[jobID]
    if !exists {
        return fmt.Errorf("job not found: %s", jobID)
    }
    job.CurrentAction = job.OriginalAction
    return nil
}

// ScheduleRoutine schedules grouped device actions
func (s *Scheduler) ScheduleRoutine(r *Routine, canSelfSchedule bool) error {
    s.mu.Lock()
    defer s.mu.Unlock()

    if _, exists := s.routines[r.ID]; exists {
        return fmt.Errorf("routine already exists: %s", r.ID)
    }

    // Each device in the routine gets an action
    routineAction := r.Action
    startTime := r.StartTime.Format("15:04")

    _, err := s.scheduler.Tag(r.ID).At(startTime).Do(func() {
        for _, deviceID := range r.DeviceIDs {
            CommunicateToDevice(deviceID, canSelfSchedule)
            routineAction()
        }
    })
    if err != nil {
        return err
    }

    if r.StopTime != nil {
        stopStr := r.StopTime.Format("15:04")
        _, err = s.scheduler.Tag(r.ID + "_stop").At(stopStr).Do(func() {
            fmt.Printf("[Routine %s] Routine stopping devices at %s.\n", r.ID, stopStr)
        })
        if err != nil {
            return err
        }
    }

    s.routines[r.ID] = r
    return nil
}