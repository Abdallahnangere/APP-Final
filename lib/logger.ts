// lib/logger.ts — Structured logger for SaukiMart
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  action: string;
  userId?: string;
  details?: Record<string, unknown>;
  statusCode?: number;
  duration?: number;
}

function log(level: LogLevel, service: string, action: string, data?: Partial<Omit<LogEntry, 'level' | 'service' | 'action' | 'timestamp'>>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service,
    action,
    ...data,
  };
  if (process.env.NODE_ENV === 'development') {
    const color = { DEBUG: '\x1b[37m', INFO: '\x1b[36m', WARN: '\x1b[33m', ERROR: '\x1b[31m', CRITICAL: '\x1b[35m' }[level];
    console.log(`${color}[${level}] ${service}:${action}\x1b[0m`, data || '');
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (s: string, a: string, d?: any) => log('DEBUG', s, a, d),
  info:  (s: string, a: string, d?: any) => log('INFO',  s, a, d),
  warn:  (s: string, a: string, d?: any) => log('WARN',  s, a, d),
  error: (s: string, a: string, d?: any) => log('ERROR', s, a, d),
  critical: (s: string, a: string, d?: any) => log('CRITICAL', s, a, d),
};
