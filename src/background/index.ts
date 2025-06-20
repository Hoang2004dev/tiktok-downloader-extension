import { handleDownloadRequest } from "./downloader";
import { handleLogMessage } from "./logger";

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Background] TikTok Downloader Extension Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "log") {
    handleLogMessage(request);
    return;
  }

  if (request.action === "download") {
    handleDownloadRequest(request, sender);
    return;
  }
});
