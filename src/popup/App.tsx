import { useEffect, useState } from "react";

import browser from "webextension-polyfill";

import { PopupControls } from "../components/PopupControls/PopupControls";
import { PopupNav } from "../components/PopupNav/PopupNav";
import { PopupMain } from "../components/PopupMain/PopupMain";
import { PopupFooter } from "../components/PopupFooter/PopupFooter";

export const App = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const result = await browser.storage.local.get("isVisible");
        if (typeof result.isVisible === "boolean") {
          setIsVisible(result.isVisible);
        }
      } catch (err) {
        console.warn("Failed to read visibility from storage:", err);
      }
    };

    fetchVisibility();
  }, []);

  return (
    <div className="popup">
      <PopupControls isVisible={isVisible} />
      <PopupNav />
      <PopupMain isVisible={isVisible} setIsVisible={setIsVisible} />
      <PopupFooter />
    </div>
  );
};
