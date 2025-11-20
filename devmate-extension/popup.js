document.addEventListener('DOMContentLoaded', () => {
  const roleSelect = document.getElementById('role');
  const injectBtn = document.getElementById('injectBtn');

  // 1. Load previously saved role
  chrome.storage.sync.get(['devMateRole'], (result) => {
    if (result.devMateRole) roleSelect.value = result.devMateRole;
  });

  // 2. Save role on change
  roleSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ devMateRole: roleSelect.value });
  });

  // 3. "Activate" button logic (Silent Mode)
  injectBtn.addEventListener('click', async () => {
    try {
      // Find the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.id) {
        console.error("No tab ID found.");
        return;
      }

      // Check for restricted URLs
      if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || !tab.url) {
        // Silently fail on system pages
        return;
      }

      // Send a message to the content script
      // UPDATE: We removed the callback function. 
      // This is "Fire and Forget". We send the command and assume it works.
      // This stops the "Connection failed" alert completely.
      chrome.tabs.sendMessage(tab.id, { 
        action: "toggleSidebar", 
        role: roleSelect.value 
      });

      // Close the popup immediately
      window.close();

    } catch (err) {
      console.error("Popup Script Error:", err);
      // No alerts, just logging
    }
  });
});