//ui.ts=========================
import { downloadAllImages } from "./imageDownloader";
import { downloadAllVideos } from "./videoDownloader";
import { sendLog } from "./logger";

export function createFloatingDownloadButton(
  type: "image" | "video",
  container: HTMLElement,
  position: "top-left" | "bottom-left" | "bottom-right" = "bottom-left"
): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = type === "image" ? "⬇ Download image" : "⬇ Download video";
  button.className = "custom-download-button";

  const isTop = position === "top-left";
  const isRight = position === "bottom-right";

  Object.assign(button.style, {
    position: "absolute",
    zIndex: "9999",
    padding: "8px 12px",
    backgroundColor: type === "image" ? "#ff4242" : "#1da1f2",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.2s ease-in-out",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    top: isTop ? "10px" : "auto",
    bottom: isTop ? "auto" : "10px",
    left: isRight ? "auto" : "10px",
    right: isRight ? "10px" : "auto",
    pointerEvents: "auto",
    userSelect: "none"
  });

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    sendLog("log", `Click download button ${type}`);

    if (type === "image") {
      downloadAllImages();
    } else {
      downloadAllVideos(container);
    }
  });

  ["mousedown", "mouseup"].forEach(evt =>
    button.addEventListener(evt, e => e.stopPropagation())
  );

  button.addEventListener("mouseenter", () => {
    button.style.transform = "scale(1.05)";
    button.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "scale(1)";
    button.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
  });

  return button;
}
