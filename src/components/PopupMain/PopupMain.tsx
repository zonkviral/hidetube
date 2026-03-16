import React from "react";

import browser from "webextension-polyfill";

import { applyToIframe } from "../../utils/applyToIframe";
import { sendVisibility } from "../../utils/sendVisibility";

import "./PopupMain.css";

type PopupMainProps = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export const PopupMain = ({ isVisible, setIsVisible }: PopupMainProps) => {
  const toggleVisibility = async () => {
    const newState = !isVisible;
    setIsVisible(newState);

    try {
      await browser.storage.local.set({ isVisible: newState });
    } catch (err) {
      console.error("Failed to save visibility:", err);
    }

    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab?.id) return;

      if (tab.url?.includes("youtube.com/watch")) {
        try {
          await browser.tabs.sendMessage(tab.id, { type: "PING" });
        } catch {
          await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
          await new Promise((r) => setTimeout(r, 100));
        }
        sendVisibility(tab.id, newState);
        return;
      }

      const frames = await browser.webNavigation.getAllFrames({ tabId: tab.id });
      const embedPatterns = ["youtube.com/embed", "youtube-nocookie.com/embed"];
      const ytFrames = frames?.filter((f) => embedPatterns.some((p) => f.url.includes(p)));

      if (ytFrames && ytFrames.length > 0) {
        for (const frame of ytFrames) {
          try {
            await browser.tabs.sendMessage(tab.id, { type: "PING" }, { frameId: frame.frameId });
          } catch {
            await browser.scripting.executeScript({
              target: { tabId: tab.id, frameIds: [frame.frameId] },
              files: ["content.js"],
            });
            await new Promise((r) => setTimeout(r, 100));
          }
          sendVisibility(tab.id, newState, frame.frameId);
        }
        return;
      }

      if (tab.url?.includes("youtube.com") || tab.url?.includes("youtube-nocookie.com")) {
        applyToIframe(tab);
      }
    } catch (err) {
      console.error("Failed to toggle overlay:", err);
    }
  };

  return (
    <div className="popup__main">
      <p className="popup__status">
        Overlay: <strong>{isVisible ? "Shown" : "Hidden"}</strong>
      </p>
      <label className="popup__toggle">
        <input
          className="popup__toggle-input"
          type="checkbox"
          onChange={toggleVisibility}
          checked={!isVisible}
        />
        <span className="popup__slider popup__slider--round">Toggle Overlay</span>
      </label>
    </div>
  );
};
