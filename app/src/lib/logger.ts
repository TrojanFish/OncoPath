/**
 * OncoPath Production Telemetry & Structured Logger
 * Outputs structured JSON logs suitable for CloudWatch, Datadog, Loki or standard VPS log files.
 */

export interface LogPayload {
  level?: 'info' | 'warn' | 'error' | 'debug';
  endpoint: string;
  clientIp?: string;
  durationMs?: number;
  statusCode?: number;
  action?: string;
  aiModel?: string;
  tokensEstimated?: number;
  cacheHit?: boolean;
  message?: string;
  error?: string | any;
  meta?: Record<string, any>;
}

export function logEvent(payload: LogPayload) {
  const level = payload.level || 'info';
  const logEntry = {
    timestamp: new Date().toISOString(),
    service: 'oncopath-web',
    environment: process.env.NODE_ENV || 'development',
    level,
    ...payload,
  };

  const output = JSON.stringify(logEntry);

  switch (level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'debug':
      console.debug(output);
      break;
    default:
      console.log(output);
      break;
  }
}
