interface DownloadRequest {
  action: "download";
  url: string;
  mediaType?: "video" | "image"; 
}

export function handleDownloadRequest(
  request: DownloadRequest,
  sender: chrome.runtime.MessageSender
): void {
  const url = request.url;
  const mediaType = request.mediaType;

  try {
    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 10000);
    const rawName = `media_${timestamp}_${rand}`;

    // Phân loại chuẩn: ưu tiên mediaType, fallback theo URL
    const isVideo = mediaType === "video" || (
      !mediaType && (url.includes(".mp4") || sender?.url?.includes("/video/"))
    );

    // Lấy đuôi file nếu có, fallback mp4/jpg
    const extMatch = url.match(/\.(mp4|jpg|jpeg|png|gif|webp)/i);
    const ext = extMatch?.[1] ?? (isVideo ? "mp4" : "jpg");

    const subfolder = isVideo ? "videos" : "images";
    const filename = `${rawName}.${ext}`;
    const fullPath = `TiktokMediaDownloader/${subfolder}/${filename}`;

    chrome.downloads.download(
      {
        url: url,
        filename: fullPath,
        saveAs: false,
        conflictAction: "uniquify",
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error(
            `[Background] Error loading ${url}:`,
            chrome.runtime.lastError.message
          );
        } else {
          console.log(
            `[Background] Loading ID file: ${downloadId} -> ${fullPath}`
          );
        }
      }
    );
  } catch (e) {
    console.error(`[Background] Error processing download URL:`, e);
  }
}
