import logger from '../utils/logger';

/**
 * Health monitoring for production stability
 * Tracks server health and prevents cascading failures
 */
class HealthMonitor {
  private errorCount = 0;
  private lastErrorReset = Date.now();
  private isHealthy = true;
  private readonly ERROR_THRESHOLD = 10; // errors per minute
  private readonly RESET_INTERVAL = 60000; // 1 minute
  
  /**
   * Record an error
   * If too many errors occur, mark server as unhealthy
   */
  recordError(error: Error, context?: string): void {
    this.errorCount++;
    
    logger.error(`⚠️ Error recorded (${this.errorCount}/${this.ERROR_THRESHOLD}):`, {
      message: error.message,
      context,
      stack: error.stack
    });
    
    // Check if we've exceeded error threshold
    if (this.errorCount >= this.ERROR_THRESHOLD) {
      this.isHealthy = false;
      logger.error(`🚨 Server marked UNHEALTHY - ${this.errorCount} errors in last minute`);
    }
    
    // Reset counter every minute
    const now = Date.now();
    if (now - this.lastErrorReset >= this.RESET_INTERVAL) {
      logger.info(`🔄 Resetting error counter: ${this.errorCount} errors in last minute`);
      this.errorCount = 0;
      this.lastErrorReset = now;
      
      // Mark healthy again if errors have stopped
      if (!this.isHealthy) {
        this.isHealthy = true;
        logger.info('✅ Server recovered - marked HEALTHY');
      }
    }
  }
  
  /**
   * Check if server is healthy
   */
  getHealth(): { healthy: boolean; errorCount: number; message: string } {
    return {
      healthy: this.isHealthy,
      errorCount: this.errorCount,
      message: this.isHealthy 
        ? 'Server is healthy' 
        : `Server unhealthy - ${this.errorCount} errors in last minute`
    };
  }
  
  /**
   * Force mark as healthy (for recovery)
   */
  markHealthy(): void {
    this.isHealthy = true;
    this.errorCount = 0;
    this.lastErrorReset = Date.now();
    logger.info('✅ Server manually marked HEALTHY');
  }
  
  /**
   * Get error statistics
   */
  getStats() {
    return {
      errorCount: this.errorCount,
      errorsPerMinute: this.errorCount,
      threshold: this.ERROR_THRESHOLD,
      healthy: this.isHealthy,
      timeSinceReset: Date.now() - this.lastErrorReset
    };
  }
}

export const healthMonitor = new HealthMonitor();
