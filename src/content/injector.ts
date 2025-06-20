import { sendLog } from "./logger";
import { createFloatingDownloadButton } from "./ui";

const TARGET_SELECTORS: { selector: string; type: "image" | "video" }[] = [
  { selector: "div[data-e2e='detail-photo']", type: "image" },
  { selector: "div.swiper.swiper-initialized.swiper-horizontal.swiper-pointer-events", type: "image" },
  { selector: "div[data-e2e='detail-video']", type: "video" },
  { selector: "div[data-e2e='browse-video']", type: "video" }, 
  { selector: "div.css-1tunefa-DivVideoContainer.e11s2kul20", type: "video" }
];

export function addDownloadButton(): void {
  const currentUrl = window.location.href;
  sendLog("log", `Current URL: ${currentUrl}`);

  // --- /photo/
  if (currentUrl.includes("/photo/")) {
    removeDownloadButtons("image");

    TARGET_SELECTORS.forEach(({ selector, type }) => {
      if (type !== "image") return;
      const container = document.querySelector(selector) as HTMLElement | null;
      if (container) injectButtonNextTo(container, type, "bottom-left");
    });

    return;
  }

  // --- /video/
  if (currentUrl.includes("/video/")) {
    removeDownloadButtons("video");

    TARGET_SELECTORS.forEach(({ selector, type }) => {
      if (type !== "video") return;
      const container = document.querySelector(selector) as HTMLElement | null;
      if (container) {
        const isBrowseVideo = selector === "div[data-e2e='browse-video']";
        injectButtonNextTo(container, type, isBrowseVideo ? "bottom-left" : "top-left"); 
      }
    });

    return;
  }

  // --- / or /foryou
  if (currentUrl === "https://www.tiktok.com/" || currentUrl.includes("/foryou")) {
    const main = document.querySelector("main#main-content-homepage_hot") as HTMLElement | null;
    if (main) {
      injectFixedDownloadButton(main, "video");
    }
    return;
  }

  // --- /following
  if (currentUrl.includes("/following")) {
    const main = document.querySelector("main#main-content-homepage_follow") as HTMLElement | null;
    if (main) {
      injectFixedDownloadButton(main, "video");
    }
    return;
  }

  // --- fallback
  removeDownloadButtons();
}

// Attach the button to the correct position depending on the type.
function injectButtonNextTo(container: HTMLElement, type: "image" | "video", position: "top-left" | "bottom-left" = "bottom-left"): void {
  const parent = container.parentElement;
  if (!parent) return;

  if (parent.querySelector(".custom-download-button")) return;

  const button = createFloatingDownloadButton(type, container, position);
  parent.appendChild(button);
  sendLog("log", `Attach download button (${type}) at ${position}`);
}

function injectFixedDownloadButton(container: HTMLElement, type: "image" | "video"): void {
  if (document.querySelector(".custom-download-button")) return;

  const button = createFloatingDownloadButton(type, container, "bottom-right");

  Object.assign(button.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px"
  });

  document.body.appendChild(button);
  sendLog("log", `Fixed button attachment (${type}) in the lower right corner`);
}

export function removeDownloadButtons(exceptType?: "image" | "video"): void {
  const buttons = document.querySelectorAll(".custom-download-button");
  buttons.forEach((btn) => {
    const text = btn.textContent || "";
    const isImageBtn = text.includes("image") || text.includes("ảnh");
    const isVideoBtn = text.includes("video");

    if (
      (exceptType === "image" && isVideoBtn) ||
      (exceptType === "video" && isImageBtn) ||
      !exceptType
    ) {
      btn.remove();
      sendLog("log", `Delete button ${isVideoBtn ? "video" : "ảnh"} not suitable.`);
    }
  });
}

// Monitor DOM to auto-inject when TikTok SPA changes page
export function observeDOMForInjection(): void {
  const observer = new MutationObserver(() => addDownloadButton());
  observer.observe(document.body, { childList: true, subtree: true });
}
