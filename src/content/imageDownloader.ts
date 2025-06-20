import { sendLog } from "./logger";

export function downloadAllImages(): void {
  sendLog("log", "Start loading all images...");

  const swiperWrappers = document.querySelectorAll("div.swiper-wrapper");
  if (swiperWrappers.length === 0) {
    sendLog("warn", "Swiper-wrapper not found.");
    return;
  }

  const uniqueIndexes = new Set<string>();
  const imageSources: string[] = [];

  swiperWrappers.forEach((wrapper) => {
    const slides = wrapper.querySelectorAll("div.swiper-slide");
    slides.forEach((slide) => {
      const indexAttr = slide.getAttribute("data-swiper-slide-index");
      if (indexAttr && !uniqueIndexes.has(indexAttr)) {
        uniqueIndexes.add(indexAttr);
        const img = slide.querySelector("img");
        if (img?.src) {
          imageSources.push(img.src);
          sendLog("log", `Image index=${indexAttr}: ${img.src}`);
        }
      }
    });
  });

  if (!imageSources.length) {
    sendLog("warn", "No valid image found.");
    return;
  }

  imageSources.forEach((src, i) => {
    chrome.runtime.sendMessage({
      action: "download",
      url: src,
      mediaType: "image"
    });
    sendLog("log", `Submit photo download request ${i + 1}: ${src}`);
  });
}
