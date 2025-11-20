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
    existingContainer.style.display = existingContainer.style.display === 'none' ? 'flex' : 'none';
  } else {
    createSidebar();
  }
}

function createSidebar() {
  // 1. Main Container (Flexbox)
  const container = document.createElement('div');
  container.id = 'devmate-container';
  container.style.cssText = `
    position: fixed; top: 0; right: 0; height: 100vh; width: 400px;
    z-index: 2147483647; display: flex; flex-direction: row;
    box-shadow: -5px 0 15px rgba(0,0,0,0.5); background: transparent;
  `;

  // 2. Drag Handle (The "Resizer" on the left edge)
  const resizer = document.createElement('div');
  resizer.style.cssText = `
    width: 5px; cursor: col-resize; background: transparent;
    height: 100%; flex-shrink: 0; transition: background 0.2s;
  `;
  // Visual feedback when hovering the handle
  resizer.onmouseover = () => resizer.style.background = '#007acc';
  resizer.onmouseout = () => resizer.style.background = 'transparent';

  // 3. The Iframe
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL("sidebar.html");
  iframe.style.cssText = "flex-grow: 1; border: none; height: 100%; background: #1e1e1e;";

  // 4. Assembly
  container.appendChild(resizer);
  container.appendChild(iframe);
  document.body.appendChild(container);

  // 5. Resize Logic
  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize'; // Force cursor change
    iframe.style.pointerEvents = 'none'; // Disable iframe so mouse doesn't get stuck inside it
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    // Calculate new width (Window Width - Mouse X Position)
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 250 && newWidth < 800) { // Constraints
      container.style.width = `${newWidth}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = 'default';
      iframe.style.pointerEvents = 'auto'; // Re-enable iframe
    }
  });
}

// Context Scraper
window.addEventListener("message", (event) => {
  if (event.data.type === "DEVMATE_GET_CONTEXT") {
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