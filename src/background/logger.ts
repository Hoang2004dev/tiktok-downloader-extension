interface LogRequest {
  action: "log";
  level: "log" | "warn" | "error" | string;
  message: string;
  timestamp: string;
}

export function handleLogMessage(request: LogRequest): void {
  const { level, message, timestamp } = request;
  const prefix = `[Content Script | ${timestamp}]`;

  switch (level) {
    case "log": console.log(prefix, message); break;
    case "warn": console.warn(prefix, message); break;
    case "error": console.error(prefix, message); break;
    default: console.log(prefix, `[${level}]`, message);
  }
}
