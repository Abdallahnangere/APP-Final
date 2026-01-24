/**
 * Comprehensive Logging System
 * Provides structured logging for all API operations
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  action: string;
  userId?: string;
  details?: any;
  error?: string;
  statusCode?: number;
  duration?: number;
}

class Logger {
  /**
   * Format and log entries with consistent structure
   */
  private formatLog(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log API request
   */
  logApiRequest(
    service: string,
    action: string,
    userId?: string,
    details?: any
  ): (statusCode: number, result?: any, error?: Error) => void {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    console.log(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        service,
        action,
        userId,
        details: { ...details, requestId, type: 'REQUEST_START' },
      })
    );

    // Return function to log completion
    return (statusCode: number, result?: any, error?: Error) => {
      const duration = Date.now() - startTime;
      const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;

      console.log(
        this.formatLog({
          timestamp: new Date().toISOString(),
          level,
          service,
          action,
          userId,
          statusCode,
          duration,
          details: { ...result, requestId, type: 'REQUEST_END' },
          error: error?.message,
        })
      );
    };
  }

  /**
   * Log transaction
   */
  logTransaction(
    userId: string,
    transactionType: string,
    amount: number,
    status: 'PENDING' | 'SUCCESS' | 'FAILED',
    details?: any
  ) {
    console.log(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: status === 'SUCCESS' ? LogLevel.INFO : LogLevel.WARN,
        service: 'TRANSACTION',
        action: transactionType,
        userId,
        details: { amount, status, ...details },
      })
    );
  }

  /**
   * Log authentication event
   */
  logAuth(
    action: 'LOGIN' | 'REGISTER' | 'PIN_VERIFY' | 'PIN_RESET',
    phone: string,
    success: boolean,
    details?: any
  ) {
    console.log(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: success ? LogLevel.INFO : LogLevel.WARN,
        service: 'AUTH',
        action,
        userId: phone,
        details: { success, ...details },
      })
    );
  }

  /**
   * Log security event
   */
  logSecurityEvent(
    event: 'INVALID_REQUEST' | 'UNAUTHORIZED' | 'RATE_LIMITED' | 'SUSPICIOUS_ACTIVITY',
    details: any
  ) {
    console.log(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        service: 'SECURITY',
        action: event,
        details,
      })
    );
  }

  /**
   * Log error
   */
  logError(service: string, action: string, error: Error, details?: any) {
    console.error(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        service,
        action,
        error: error.message,
        details,
      })
    );
  }

  /**
   * Log critical event
   */
  logCritical(action: string, error: Error, details?: any) {
    console.error(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.CRITICAL,
        service: 'SYSTEM',
        action,
        error: error.message,
        details,
      })
    );
  }

  /**
   * Log webhook processing
   */
  logWebhook(
    provider: string,
    transactionId: string,
    status: string,
    details?: any
  ) {
    console.log(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        service: 'WEBHOOK',
        action: provider,
        details: { transactionId, status, ...details },
      })
    );
  }

  /**
   * Log API call to external service
   */
  logExternalApiCall(
    service: string,
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    details?: any
  ) {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.DEBUG;
    console.log(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level,
        service: `EXTERNAL_API_${service}`,
        action: `${method} ${endpoint}`,
        statusCode,
        duration,
        details,
      })
    );
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE',
    table: string,
    duration: number,
    success: boolean,
    details?: any
  ) {
    console.log(
      this.formatLog({
        timestamp: new Date().toISOString(),
        level: success ? LogLevel.DEBUG : LogLevel.ERROR,
        service: 'DATABASE',
        action: `${operation}_${table}`,
        duration,
        details: { success, ...details },
      })
    );
  }
}

export const logger = new Logger();
