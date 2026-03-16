import browser from "webextension-polyfill";

export const injectContentScript = (tabId: number, frameIds?: number[]) => {
  return browser.scripting.executeScript({
    target: frameIds ? { tabId, frameIds } : { tabId },
    files: ["src/extension/content.js"],
  });
};
