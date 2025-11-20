document.addEventListener('DOMContentLoaded', () => {
  const roleSelect = document.getElementById('role');
  const injectBtn = document.getElementById('injectBtn');

  // 1. Load previously saved role
  chrome.storage.sync.get(['devMateRole'], (result) => {
    if (result.devMateRole) roleSelect.value = result.devMateRole;
  });

  // 2. Save role whenever user changes it
  roleSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ devMateRole: roleSelect.value });
  });

  // 3. "Activate" button logic with ERROR HANDLING
  injectBtn.addEventListener('click', async () => {
    try {
      // Find the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        console.error("No tab ID found.");
        return;
      }

      // Check for restricted URLs
      if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || !tab.url) {
        //alert("DevMate cannot run on this system page. Please try a real website like GitHub.");
        return;
      }

      // Send a message to the content script
      // We use a callback to catch connection errors immediately
      chrome.tabs.sendMessage(tab.id, { 
        action: "toggleSidebar", 
        role: roleSelect.value 
      }, (response) => {
        if (chrome.runtime.lastError) {
          // THIS IS WHERE YOUR ERROR HAPPENED
          alert("Connection failed! Please REFRESH this webpage and try again.");
          console.error(chrome.runtime.lastError.message);
        } else {
          // Success! Close popup
          window.close();
        }
      });

    } catch (err) {
      console.error("Popup Script Error:", err);
      alert("Something went wrong. Check console.");
    }
  });
});