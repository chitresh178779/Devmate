chrome.runtime.onInstalled.addListener(() => {
  console.log("DevMate Service Worker Installed.");
});

// 2. Optional: Listen for tab updates (Useful for resetting state if needed)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log(`Tab ${tabId} updated: ${tab.url}`);
  }
});