package scheduler

import (
	"context"
	"fmt"
	"sync"
	"time"
	// "github.com/bsm/redislock"
	// "github.com/redis/go-redis/v9"
	// "github.com/bsm/redislock"
	// "github.com/redis/go-redis/v9"
)

// import "pos-coffeshop/internal/scheduler"

// Config holds scheduler configuration
type Config struct {
	// Redis configuration
	RedisHost     string
	RedisPort     string
	RedisPassword string
	RedisDB       int

	// Scheduler configuration
	Interval            time.Duration
	LockKey             string
	LockTTL             time.Duration
	LockRefreshInterval time.Duration
	RunOnStartup        bool

	// Task function to execute
	TaskFunc func(ctx context.Context) error
}

// Scheduler manages distributed task scheduling
type Scheduler struct {
	config      Config
	// redisClient *redis.Client
	// locker      *redislock.Client
	ctx         context.Context
	cancel      context.CancelFunc
	mu          sync.RWMutex
	isLeader    bool
	isRunning   bool
	stopCh      chan struct{}
}

// New creates a new scheduler instance
func New(config Config) *Scheduler {
	ctx, cancel := context.WithCancel(context.Background())

	if config.Interval <= 0 {
		fmt.Println("Warning: Scheduler interval is zero or negative. Defaulting to 1 minute.")
		config.Interval = 1 * time.Minute
	}

	return &Scheduler{
		config:    config,
		ctx:       ctx,
		cancel:    cancel,
		stopCh:    make(chan struct{}),
		isLeader:  false,
		isRunning: false,
	}
}

// // Initialize sets up the scheduler
// func (s *Scheduler) Initialize() error {
// 	if s.config.RedisHost != "" {
// 		if err := s.initRedis(); err != nil {
// 			fmt.Printf("Redis initialization failed: %v. Running in local mode.\n", err)
// 		}
// 	}

// 	return nil
// }

// // initRedis establishes Redis connection
// func (s *Scheduler) initRedis() error {
// 	addr := fmt.Sprintf("%s:%s", s.config.RedisHost, s.config.RedisPort)

// 	s.redisClient = redis.NewClient(&redis.Options{
// 		Addr:     addr,
// 		Password: s.config.RedisPassword,
// 		DB:       s.config.RedisDB,
// 	})

// 	// Test connection with timeout
// 	testCtx, cancel := context.WithTimeout(s.ctx, 5*time.Second)
// 	defer cancel()

// 	if err := s.redisClient.Ping(testCtx).Err(); err != nil {
// 		s.redisClient = nil
// 		return fmt.Errorf("redis connection failed: %w", err)
// 	}

// 	s.locker = redislock.New(s.redisClient)
// 	fmt.Println("Redis connected successfully for distributed scheduling")
// 	return nil
// }

// // Start begins the scheduler
// func (s *Scheduler) Start() {
// 	s.mu.Lock()
// 	if s.isRunning {
// 		s.mu.Unlock()
// 		return
// 	}
// 	s.isRunning = true
// 	s.mu.Unlock()

// 	fmt.Println("Starting scheduler...")

// 	// Run immediately on startup if configured
// 	go s.tryRunTask()

// 	// Start the main scheduler loop
// 	go s.runSchedulerLoop()
// }

// // Stop gracefully stops the scheduler
// func (s *Scheduler) Stop() {
// 	s.mu.Lock()
// 	defer s.mu.Unlock()

// 	if !s.isRunning {
// 		return
// 	}

// 	fmt.Println("Stopping scheduler...")
// 	s.cancel()
// 	close(s.stopCh)
// 	s.isRunning = false

// 	if s.redisClient != nil {
// 		s.redisClient.Close()
// 	}
// }

// // runSchedulerLoop is the main scheduling loop
// func (s *Scheduler) runSchedulerLoop() {
// 	ticker := time.NewTicker(s.config.Interval)
// 	defer ticker.Stop()

// 	for {
// 		select {
// 		case <-ticker.C:
// 			s.tryRunTask()

// 		case <-s.ctx.Done():
// 			fmt.Println("Scheduler loop stopped")
// 			return

// 		case <-s.stopCh:
// 			fmt.Println("Scheduler received stop signal")
// 			return
// 		}
// 	}
// }

// // tryRunTask attempts to acquire lock and run the task
// func (s *Scheduler) tryRunTask() {
// 	// Check if we should use distributed locking
// 	if s.locker != nil {
// 		s.runWithDistributedLock()
// 	} else {
// 		s.runLocal()
// 	}
// }

// // runWithDistributedLock uses Redis distributed lock
// func (s *Scheduler) runWithDistributedLock() {
// 	lock, err := s.acquireLock()
// 	if err != nil {
// 		if err == redislock.ErrNotObtained {
// 			// Another pod has the lock, this is normal
// 			return
// 		}
// 		fmt.Printf("Error acquiring distributed lock: %v\n", err)
// 		return
// 	}

// 	// We got the lock, run the task
// 	defer func() {
// 		if err := lock.Release(s.ctx); err != nil {
// 			fmt.Printf("Error releasing lock: %v\n", err)
// 		} else {
// 			s.setLeader(false)
// 		}
// 	}()

// 	s.setLeader(true)
// 	s.executeTask()
// }

// // runLocal runs task without distributed lock (local/dev mode)
// func (s *Scheduler) runLocal() {
// 	// In local mode, just run the task
// 	// (assumes only one instance is running)
// 	fmt.Println("Running in local mode (no distributed lock)")
// 	s.executeTask()
// }

// // acquireLock tries to acquire Redis lock
// func (s *Scheduler) acquireLock() (*redislock.Lock, error) {
// 	lockKey := s.config.LockKey
// 	if lockKey == "" {
// 		lockKey = "app-scheduler-lock"
// 	}

// 	podName := os.Getenv("POD_NAME")
// 	if podName == "" {
// 		podName = "local"
// 	}

// 	metadata := fmt.Sprintf("pod:%s|host:%s|time:%s",
// 		podName,
// 		getHostname(),
// 		time.Now().Format(time.RFC3339),
// 	)

// 	lock, err := s.locker.Obtain(s.ctx, lockKey, s.config.LockTTL, &redislock.Options{
// 		RetryStrategy: redislock.LinearBackoff(500 * time.Millisecond),
// 		Metadata:      metadata,
// 	})

// 	return lock, err
// }

// // executeTask runs the actual task with timeout
// func (s *Scheduler) executeTask() {
// 	fmt.Printf("[%s] Starting scheduled task...\n", time.Now().Format("2006-01-02 15:04:05"))

// 	// Create timeout context for task execution
// 	taskCtx, cancel := context.WithTimeout(s.ctx, s.config.Interval/2)
// 	defer cancel()

// 	startTime := time.Now()

// 	// Execute the task function
// 	if s.config.TaskFunc != nil {
// 		if err := s.config.TaskFunc(taskCtx); err != nil {
// 			fmt.Printf("[%s] Task failed: %v\n", time.Now().Format("2006-01-02 15:04:05"), err)
// 		} else {
// 			duration := time.Since(startTime)
// 			fmt.Printf("[%s] Task completed successfully in %v\n",
// 				time.Now().Format("2006-01-02 15:04:05"), duration)
// 		}
// 	}
// }

// // setLeader updates the leader status
// func (s *Scheduler) setLeader(isLeader bool) {
// 	s.mu.Lock()
// 	defer s.mu.Unlock()
// 	s.isLeader = isLeader
// }

// // IsLeader returns true if this instance is currently the leader
// func (s *Scheduler) IsLeader() bool {
// 	s.mu.RLock()
// 	defer s.mu.RUnlock()
// 	return s.isLeader
// }

// // IsRunning returns true if scheduler is running
// func (s *Scheduler) IsRunning() bool {
// 	s.mu.RLock()
// 	defer s.mu.RUnlock()
// 	return s.isRunning
// }

// // Helper function to get hostname
// func getHostname() string {
// 	if hostname, err := os.Hostname(); err == nil {
// 		return hostname
// 	}
// 	return "unknown"
// }
