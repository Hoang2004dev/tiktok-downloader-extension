import { sendLog } from "./logger";

function extractBitrateFromUrl(url: string): number {
  try {
    const urlObj = new URL(url);
    const br = parseInt(urlObj.searchParams.get("br") || "0", 10);
    const bt = parseInt(urlObj.searchParams.get("bt") || "0", 10);
    return Math.max(br, bt);
  } catch {
    sendLog("warn", `Cannot parse bitrate from URL: ${url}`);
    return 0;
  }
}

function getBestVideoSource(videoElement: HTMLVideoElement, pageType: string): string | null {
  const sources = videoElement.querySelectorAll("source[src]");
  let bestSource: string | null = null;
  let highestBitrate = 0;

  sendLog("log", `Video Analytics (${pageType}) have ${sources.length} <source> tag.`);

  sources.forEach((source, index) => {
    const src = (source as HTMLSourceElement).src;
    if (!src) {
      sendLog("warn", `Source #${index + 1} no valid src.`);
      return;
    }

    const bitrate = extractBitrateFromUrl(src);
    sendLog("log", `Source #${index + 1} bitrate = ${bitrate} | ${src}`);

    if (bitrate > highestBitrate) {
      bestSource = src;
      highestBitrate = bitrate;
    }
  });

  if (!bestSource && videoElement.src) {
    bestSource = videoElement.src;
    sendLog("warn", `No <source>. Use video.src fallback: ${bestSource}`);
  }

  return bestSource;
}

function isVisible(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    el.offsetParent !== null &&
    el.offsetWidth > 0 &&
    el.offsetHeight > 0
  );
}

export function downloadAllVideos(container: HTMLElement | null = null): void {
  sendLog("log", "Start downloading all videos (highest bitrate)...");

  const videoElements: HTMLVideoElement[] = [];
  let pageType = "unknown";

  if (container?.matches("div[data-e2e='detail-video']")) {
    pageType = "detail-video";
    const scoped = container.querySelector("video");
    if (scoped && isVisible(scoped)) {
      videoElements.push(scoped);
      sendLog("log", "Found <video> inside detail-video");
    } else {
      sendLog("warn", "<video> not found or not showing in detail-video");
    }
  } else if (container?.matches("div[data-e2e='browse-video']")) {
    pageType = "browse-video";
    const scoped = container.querySelector("video");
    if (scoped && isVisible(scoped)) {
      videoElements.push(scoped);
      sendLog("log", "Found <video> inside browse-video");
    } else {
      sendLog("warn", "<video> not found or not showing in browse-video");
    }
  } else {
    pageType = "general";
    const all = document.querySelectorAll("video");
    sendLog("log", `Checking ${all.length} <video> full page`);

    for (const vid of all) {
      if (isVisible(vid)) {
        videoElements.push(vid as HTMLVideoElement);
        sendLog("log", "Found visible video (full page fallback)");
        break;
      }
    }

    if (videoElements.length === 0) {
      sendLog("error", "No videos found to display.");
    }
  }

  const uniqueVideoUrls = new Set<string>();

  videoElements.forEach((video, i) => {
    sendLog("log", `Video processing #${i + 1}...`);
    const bestSrc = getBestVideoSource(video, pageType);

    if (bestSrc && !uniqueVideoUrls.has(bestSrc)) {
      uniqueVideoUrls.add(bestSrc);
      sendLog("log", `Video ${i + 1} (${pageType}): ${bestSrc}`);
    } else if (!bestSrc) {
      sendLog("warn", `Video ${i + 1} no valid source.`);
    } else {
      sendLog("log", `Video ${i + 1} previously processed.`);
    }
  });

  if (uniqueVideoUrls.size === 0) {
    sendLog("error", "No videos are eligible for download.");
    return;
  }

  [...uniqueVideoUrls].forEach((src, i) => {
    chrome.runtime.sendMessage({
      action: "download",
      url: src,
      mediaType: "video"
    });
    sendLog("log", `Send video download request #${i + 1}: ${src}`);
  });
}
