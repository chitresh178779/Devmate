console.log("DevMate: Content script loaded.");

// Listen for messages from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleSidebar") {
    toggleSidebar();
  }
});

function toggleSidebar() {
  const existingContainer = document.getElementById('devmate-container');
  
  if (existingContainer) {
    // If it exists, just toggle visibility (Show/Hide)
    existingContainer.style.display = existingContainer.style.display === 'none' ? 'block' : 'none';
  } else {
    // If not, Create the Sidebar Container
    const container = document.createElement('div');
    container.id = 'devmate-container';
    container.style.cssText = `
      position: fixed; top: 0; right: 0; width: 350px; height: 100vh;
      z-index: 2147483647; border-left: 1px solid #333; background: #1e1e1e;
      box-shadow: -5px 0 15px rgba(0,0,0,0.5);
    `;

    // Create the Iframe that holds the actual Chat UI
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL("sidebar.html");
    iframe.style.cssText = "width: 100%; height: 100%; border: none;";
    
    container.appendChild(iframe);
    document.body.appendChild(container);
  }
}

// Listen for "Get Context" request from the Sidebar Iframe
window.addEventListener("message", (event) => {
  if (event.data.type === "DEVMATE_GET_CONTEXT") {
    // Scrape visible text from the page to send to AI
    const code = document.body.innerText.substring(0, 10000); 
    
    const iframe = document.querySelector('#devmate-container iframe');
    if(iframe) {
      iframe.contentWindow.postMessage({
        type: "DEVMATE_CONTEXT_RESULT",
        context: code
      }, "*");
    }
  }
});