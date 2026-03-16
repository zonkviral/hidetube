import browser from "webextension-polyfill";

export const sendVisibility = (tabId: number, visible: boolean, frameId?: number): void => {
  browser.tabs
    .sendMessage(
      tabId,
      { type: "APPLY_VISIBILITY", visible },
      frameId !== undefined ? { frameId } : undefined,
    )
    .catch((err: unknown) => {
      if (
        err instanceof Error &&
        (err.message.includes("Extension context invalidated") ||
          err.message.includes("Receiving end does not exist"))
      )
        return;
      console.warn("Error sending message:", err);
    });
};
