import browser from "webextension-polyfill";

import { applyToIframe } from "../utils/applyToIframe";
import { injectContentScript } from "../utils/injectContentScript";
import { sendVisibility } from "../utils/sendVisibility";
import { getVisibility } from "../utils/getVisibility";
import type { MessageResponse } from "./types";

const isYouTubeVideoUrl = (url?: string) => url?.includes("youtube.com/watch");

const injectAndApplyVisibility = async (tabId: number) => {
  try {
    const tab = await browser.tabs.get(tabId);
    if (!tab) return;

    let needsInjection = false;

    try {
      const response: MessageResponse = await browser.tabs.sendMessage(tabId, { type: "PING" });
      needsInjection = response !== "PONG";
    } catch {
      needsInjection = true;
    }

    if (needsInjection) {
      await injectContentScript(tabId);
    }

    const visible = await getVisibility();
    sendVisibility(tabId, visible);
  } catch (err) {
    console.warn("Injection failed:", err);
  }
};

browser.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0) return;

  const embed = ["youtube-nocookie.com/embed", "youtube.com/embed"];
  if (!embed.some((sub) => details.url.includes(sub))) return;

  try {
    await injectContentScript(details.tabId, [details.frameId]);
    const visible = await getVisibility();
    sendVisibility(details.tabId, visible, details.frameId);
  } catch (err) {
    console.warn("Iframe injection failed:", err);
  }
});

browser.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (isYouTubeVideoUrl(details.url)) {
    injectAndApplyVisibility(details.tabId);
  }
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await browser.tabs.get(activeInfo.tabId);

  if (isYouTubeVideoUrl(tab.url)) {
    injectAndApplyVisibility(tab.id!);
  }

  applyToIframe(tab);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    if (isYouTubeVideoUrl(tab.url)) {
      injectAndApplyVisibility(tabId);
      return;
    }

    applyToIframe(tab);
  }
});
