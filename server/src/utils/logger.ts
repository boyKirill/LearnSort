type LogLevel = 'info' | 'warn' | 'error';

function log(level: LogLevel, event: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    event,
    time: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => log('info', event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => log('warn', event, meta),
  error: (event: string, meta?: Record<string, unknown>) => log('error', event, meta),
};
