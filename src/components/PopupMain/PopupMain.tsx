import React from "react";

import { applyToIframe } from "../../utils/applyToIframe";
import { sendVisibility } from "../../utils/sendVisibility";

import "./PopupMain.css";
import browser from "webextension-polyfill";

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
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tab = tabs[0];
      if (!tab?.id) return;

      if (tab.url?.includes("youtube.com/watch")) {
        try {
          await browser.tabs.sendMessage(tab.id, { type: "PING" });
        } catch {
          await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["src/extension/content.js"],
          });
        }
        sendVisibility(tab.id, newState);
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
