import browser from "webextension-polyfill";

import { injectContentScript } from "./injectContentScript";
import { sendVisibility } from "./sendVisibility";
import { getVisibility } from "./getVisibility";

export const applyToIframe = async (tab: browser.Tabs.Tab) => {
  if (!tab.id) return;

  try {
    const frames = await browser.webNavigation.getAllFrames({ tabId: tab.id });
    const embed = ["youtube-nocookie.com/embed", "youtube.com/embed"];
    const ytFrame = frames?.find((frame) => embed.some((sub) => frame.url.includes(sub)));

    if (!ytFrame) return;

    await injectContentScript(tab.id, [ytFrame.frameId]);
    const visible = await getVisibility();
    sendVisibility(tab.id, visible, ytFrame.frameId);
  } catch (err) {
    console.warn("Injection failed:", err);
  }
};
