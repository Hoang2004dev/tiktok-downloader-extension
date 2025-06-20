//===========================index.ts
import { addDownloadButton, observeDOMForInjection } from "./injector";
import { sendLog } from "./logger";

window.addEventListener("load", () => {
  sendLog("log", "TikTok page loaded - injecting...");
  addDownloadButton();
  observeDOMForInjection();
});
