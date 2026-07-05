(function () {
  "use strict";

  const CONFIG = {
    WIDGET_URL: "https://pivotcareai-widget.vercel.app",
    DEFAULT_POSITION: "bottom-right",
    DEFAULT_COLOR: "#3b82f6",
  };

  const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>`;

  const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`;

  let iframeEl = null;
  let containerEl = null;
  let buttonEl = null;
  let isOpen = false;
  let organizationId = null;
  let position = CONFIG.DEFAULT_POSITION;
  let activeColor = CONFIG.DEFAULT_COLOR;

  const currentScript = document.currentScript;
  if (currentScript) {
    organizationId = currentScript.getAttribute("data-organization-id");
    position = currentScript.getAttribute("data-position") || CONFIG.DEFAULT_POSITION;
  } else {
    const scripts = document.querySelectorAll('script[src*="widget.js"], script[src*="embed"]');
    const match = Array.from(scripts).find((s) => s.hasAttribute("data-organization-id"));
    if (match) {
      organizationId = match.getAttribute("data-organization-id");
      position = match.getAttribute("data-position") || CONFIG.DEFAULT_POSITION;
    }
  }

  if (!organizationId) {
    console.error("Pivot Widget: data-organization-id attribute is required");
    return;
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", render);
    } else {
      render();
    }
  }

  function render() {
    buttonEl = document.createElement("button");
    buttonEl.id = "pivot-widget-button";
    buttonEl.innerHTML = CHAT_ICON;
    buttonEl.style.cssText = `
      position: fixed;
      ${position === "bottom-right" ? "right: 20px;" : "left: 20px;"}
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${activeColor};
      color: white;
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease, background-color 0.3s ease;
    `;

    buttonEl.addEventListener("click", toggleWidget);
    buttonEl.addEventListener("mouseenter", () => {
      if (buttonEl) buttonEl.style.transform = "scale(1.05)";
    });
    buttonEl.addEventListener("mouseleave", () => {
      if (buttonEl) buttonEl.style.transform = "scale(1)";
    });
    document.body.appendChild(buttonEl);

    containerEl = document.createElement("div");
    containerEl.id = "pivot-widget-container";
    containerEl.style.cssText = `
      position: fixed;
      ${position === "bottom-right" ? "right: 20px;" : "left: 20px;"}
      bottom: 90px;
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 110px);
      z-index: 999998;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: none;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;

    iframeEl = document.createElement("iframe");
    iframeEl.src = getWidgetUrl();
    iframeEl.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
    iframeEl.allow = "microphone; clipboard-read; clipboard-write";
    containerEl.appendChild(iframeEl);
    document.body.appendChild(containerEl);

    window.addEventListener("message", handleMessage);
  }

  function getWidgetUrl() {
    const params = new URLSearchParams();
    params.append("organizationId", organizationId);
    return `${CONFIG.WIDGET_URL}?${params.toString()}`;
  }

  function handleMessage(event) {
    if (event.origin !== new URL(CONFIG.WIDGET_URL).origin) return;
    const { type, payload } = event.data || {};
    switch (type) {
      case "close":
        hideWidget();
        break;
      case "resize":
        if (payload?.height && containerEl) {
          containerEl.style.height = `${payload.height}px`;
        }
        break;
      case "SET_COLOR":
        if (payload?.primaryColor && buttonEl) {
          activeColor = payload.primaryColor;
          buttonEl.style.backgroundColor = activeColor;
        }
        break;
    }
  }

  function toggleWidget() {
    if (isOpen) {
      hideWidget();
    } else {
      showWidget();
    }
  }

  function showWidget() {
    if (containerEl && buttonEl) {
      isOpen = true;
      containerEl.style.display = "block";
      setTimeout(() => {
        if (containerEl) {
          containerEl.style.opacity = "1";
          containerEl.style.transform = "translateY(0)";
        }
      }, 10);
      buttonEl.innerHTML = CLOSE_ICON;
    }
  }

  function hideWidget() {
    if (containerEl && buttonEl) {
      isOpen = false;
      containerEl.style.opacity = "0";
      containerEl.style.transform = "translateY(10px)";
      setTimeout(() => {
        if (containerEl) containerEl.style.display = "none";
      }, 300);
      buttonEl.innerHTML = CHAT_ICON;
      buttonEl.style.backgroundColor = activeColor;
    }
  }

  function destroy() {
    window.removeEventListener("message", handleMessage);
    if (containerEl) {
      containerEl.remove();
      containerEl = null;
      iframeEl = null;
    }
    if (buttonEl) {
      buttonEl.remove();
      buttonEl = null;
    }
    isOpen = false;
  }

  function reinit(opts) {
    destroy();
    if (opts?.organizationId) organizationId = opts.organizationId;
    if (opts?.position) position = opts.position;
    init();
  }

  window.PivotWidget = {
    init: reinit,
    show: showWidget,
    hide: hideWidget,
    destroy: destroy,
  };

  init();
})();
