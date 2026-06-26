// Service Worker 등록
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/goods-shop/sw.js").catch(() => {});
}

const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = /android/i.test(navigator.userAgent);

let deferredPrompt = null;

// Android: beforeinstallprompt 이벤트 수신
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// DOM 로드 후 UI 초기화
document.addEventListener("DOMContentLoaded", () => {
  if (isStandalone) return; // 이미 설치됨 → 모든 UI 숨김

  const dismissed = localStorage.getItem("pwa-dismissed");

  // ── 히어로 배너 (상품 목록 위, 미설치 시만) ──────────────────
  const hero = document.getElementById("pwa-hero");
  if (hero && !dismissed) {
    hero.style.display = "";

    const heroBtn = document.getElementById("hero-install-btn");
    if (heroBtn) {
      heroBtn.addEventListener("click", () => {
        if (deferredPrompt) {
          // Android: 네이티브 설치 프롬프트
          triggerInstall();
        } else {
          // iOS / 기타: 안내 모달
          openInstallModal();
        }
      });
    }
  }

  // ── 하단 고정 배너 (Android, 미설치·미닫힘 시) ───────────────
  if (isAndroid && !dismissed) {
    window.addEventListener("beforeinstallprompt", () => showBottomBanner());
  }
});

// ── 하단 배너 생성 ────────────────────────────────────────────
function showBottomBanner() {
  if (document.getElementById("pwa-banner")) return;
  if (localStorage.getItem("pwa-dismissed")) return;

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

  document.getElementById("pwa-add-btn").addEventListener("click", triggerInstall);
  document.getElementById("pwa-close-btn").addEventListener("click", () => {
    banner.remove();
    localStorage.setItem("pwa-dismissed", "1");
  });
}

// ── 네이티브 설치 프롬프트 (Android Chrome) ───────────────────
async function triggerInstall() {
  if (!deferredPrompt) { openInstallModal(); return; }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById("pwa-banner")?.remove();
  const hero = document.getElementById("pwa-hero");
  if (hero) hero.style.display = "none";
  if (outcome === "dismissed") localStorage.setItem("pwa-dismissed", "1");
}

// ── 설치 안내 모달 ────────────────────────────────────────────
function openInstallModal() {
  const modal = document.getElementById("install-modal");
  if (!modal) return;
  modal.style.display = "flex";

  // OS별 안내 표시
  document.getElementById("guide-ios").style.display    = isIOS ? "" : "none";
  document.getElementById("guide-android").style.display = (!isIOS && isAndroid) ? "" : "none";
  document.getElementById("guide-other").style.display   = (!isIOS && !isAndroid) ? "" : "none";

  // Android용 모달 내 설치 버튼
  const modalBtn = document.getElementById("modal-install-btn");
  if (modalBtn) modalBtn.addEventListener("click", triggerInstall);
}

function closeInstallModal(e) {
  if (e.target === document.getElementById("install-modal")) {
    document.getElementById("install-modal").style.display = "none";
  }
}

// 전역 노출 (HTML onclick용)
window.closeInstallModal = closeInstallModal;
window.openInstallModal  = openInstallModal;
