// Service Worker 등록
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/goods-shop/sw.js").catch(() => {});
}

// 이미 설치된 상태(standalone)면 배너 불필요
if (window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true) {
  // 설치됨 — 아무것도 하지 않음
} else {
  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // 이미 닫은 적 있으면 표시 안 함
    if (localStorage.getItem("pwa-dismissed")) return;

    showBanner();
  });

  function showBanner() {
    if (document.getElementById("pwa-banner")) return;

    const banner = document.createElement("div");
    banner.id = "pwa-banner";
    banner.innerHTML = `
      <img src="/goods-shop/icons/icon.svg" alt="turingshop" class="pwa-banner-icon">
      <div class="pwa-banner-text">
        <strong>turingshop</strong>
        <span>홈 화면에 추가하면 더 빠르게 이용할 수 있어요</span>
      </div>
      <button class="pwa-banner-add" id="pwa-add-btn">추가</button>
      <button class="pwa-banner-close" id="pwa-close-btn" aria-label="닫기">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById("pwa-add-btn").addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      banner.remove();
      if (outcome === "dismissed") localStorage.setItem("pwa-dismissed", "1");
    });

    document.getElementById("pwa-close-btn").addEventListener("click", () => {
      banner.remove();
      localStorage.setItem("pwa-dismissed", "1");
    });
  }
}
