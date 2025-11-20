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

  // 3. "Activate" button logic
  injectBtn.addEventListener('click', async () => {
    // Find the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send a message to the content script on that tab
    chrome.tabs.sendMessage(tab.id, { 
      action: "toggleSidebar", 
      role: roleSelect.value 
    });
    
    // Close the popup
    window.close();
  });
});