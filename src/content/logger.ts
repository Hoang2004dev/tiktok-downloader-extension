//========================logger.ts
export function sendLog(level: string = "log", ...msgs: any[]): void {
  const payload = msgs.map((msg) =>
    typeof msg === "object" ? JSON.stringify(msg) : String(msg)
  ).join(" ");

  chrome.runtime.sendMessage({
    action: "log",
    level,
    message: payload,
    timestamp: new Date().toISOString()
  });
}
