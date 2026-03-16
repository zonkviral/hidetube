import browser from "webextension-polyfill";

import { getVisibility } from "../utils/getVisibility";

import type { Message } from "./types";

declare global {
  interface Window {
    _myExtensionScriptInjected?: boolean;
  }
}

if (!window._myExtensionScriptInjected) {
  window._myExtensionScriptInjected = true;

  let isVisible = true;

  const waitForPlayer = () => {
    return new Promise<void>((resolve) => {
      if (document.querySelector(".html5-video-player")) {
        resolve();
        return;
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(".html5-video-player")) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      window.setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 3000);
    });
  };

  const applyVisibility = (visible: boolean) => {
    isVisible = visible;
    const display = isVisible ? "" : "none";

    const elements = [
      ...document.querySelectorAll(".ytp-ce-element"),
      document.querySelector(".ytp-chrome-bottom"),
      document.querySelector(".ytp-chrome-top"),
      document.querySelector(".annotation"),
      document.querySelector(".ytp-overlays-container"),
      document.querySelector("#player-control-overlay.fadein .player-controls-content"),
    ];

    const player = document.querySelector(".html5-video-player");
    if (player instanceof HTMLElement) {
      if (!isVisible) {
        player.classList.add("ytp-hide-controls");
      } else {
        player.classList.remove("ytp-hide-controls");
      }
    }

    if (window.top !== window.self) {
      const pauseOverlay = document.querySelector(".ytp-pause-overlay-container");
      if (pauseOverlay instanceof HTMLElement) pauseOverlay.style.display = display;
    }

    elements.forEach((element) => {
      if (element instanceof HTMLElement) element.style.display = display;
    });
  };

  const bindKeyHandler = () => {
    document.addEventListener("click", () => window.focus());
    document.addEventListener("keydown", (event) => {
      const searchInput = document.querySelector<HTMLInputElement>("input#search");
      const focusedElement = document.activeElement;
      const isInEditableField = focusedElement?.closest("[contenteditable], textarea, input");

      if (event.code === "KeyH" && focusedElement !== searchInput && !isInEditableField) {
        if (!browser.runtime?.id) return;

        isVisible = !isVisible;

        browser.storage.local.set({ isVisible }).catch((err: unknown) => {
          if (err instanceof Error && err.message.includes("Extension context invalidated")) return;
          console.warn("Storage error:", err);
        });

        applyVisibility(isVisible);
      }
    });
  };

  const isMessage = (msg: unknown): msg is Message =>
    typeof msg === "object" && msg !== null && "type" in msg;

  browser.runtime.onMessage.addListener(async (msg: unknown) => {
    if (!isMessage(msg)) return;

    switch (msg.type) {
      case "APPLY_VISIBILITY":
        applyVisibility(msg.visible);
        return { ok: true };

      case "PING":
        return "PONG";
    }
  });

  const watchForPlayerUI = () => {
    let observerTimeout: number | null = null;

    const observer = new MutationObserver(() => {
      if (!browser.runtime?.id) {
        observer.disconnect();
        return;
      }

      const hasUIElements =
        document.querySelector(".ytp-ce-element") ||
        document.querySelector(".ytp-chrome-bottom") ||
        document.querySelector(".html5-video-player");

      if (observerTimeout !== null) return;

      observerTimeout = window.setTimeout(() => {
        if (hasUIElements) {
          getVisibility().then((visible) => applyVisibility(visible));
        }
        observerTimeout = null;
      }, 300);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  const initVisibility = () => {
    waitForPlayer().then(() => {
      getVisibility().then((visible) => applyVisibility(visible));
    });
  };

  initVisibility();
  watchForPlayerUI();
  bindKeyHandler();
}

export {};
