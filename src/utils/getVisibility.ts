import browser from "webextension-polyfill";

export const getVisibility = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get("isVisible");
    return typeof result.isVisible === "boolean" ? result.isVisible : true;
  } catch (err) {
    if (err instanceof Error && err.message.includes("Extension context invalidated")) {
      return true;
    }
    console.warn("Extension context invalidated – fallback to default visibility", err);
    return true;
  }
};
