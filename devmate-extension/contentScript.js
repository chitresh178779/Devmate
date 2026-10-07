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
// Builds a FRESH snapshot of the page every time it is called, so changes made
// after the sidebar was opened (edits, SPA navigation, new output) are picked up.
const DEVMATE_MAX_CONTEXT = 15000;

function isVisible(el) {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 &&
    rect.bottom > 0 && rect.top < window.innerHeight;
}

function collectContext() {
  const parts = [];
  const seen = new Set();
  const add = (label, text) => {
    text = (text || "").trim();
    if (!text || seen.has(text)) return;
    seen.add(text);
    parts.push(label ? `${label}\n${text}` : text);
  };

  add("Page:", `${document.title}\n${location.href}`);

  // 1. Whatever the user has selected is the most relevant context.
  const selection = window.getSelection()?.toString();
  add("Selected text:", selection);

  // 2. Live editor contents (textareas / code editors) and code blocks currently on screen.
  const codeSelectors = [
    "textarea", ".cm-content", ".CodeMirror-code", ".monaco-editor .view-lines",
    ".ace_text-layer", "pre", "code", ".blob-code-inner", "table.highlight"
  ].join(",");
  document.querySelectorAll(codeSelectors).forEach((el) => {
    if (el.closest("#devmate-container")) return;
    if (el.parentElement?.closest(codeSelectors)) return; // avoid nested duplicates
    if (!isVisible(el)) return;
    add("Code on screen:", el.value !== undefined && el.tagName === "TEXTAREA" ? el.value : el.innerText);
  });

  // 3. Remaining visible page text as a fallback.
  const container = document.getElementById("devmate-container");
  const prevDisplay = container ? container.style.display : null;
  if (container) container.style.display = "none";
  add("Visible page text:", document.body.innerText);
  if (container) container.style.display = prevDisplay;

  return parts.join("\n\n").substring(0, DEVMATE_MAX_CONTEXT);
}

window.addEventListener("message", (event) => {
  const iframe = document.querySelector('#devmate-container iframe');
  // Only answer requests coming from our own sidebar iframe.
  if (!iframe || event.source !== iframe.contentWindow) return;
  if (event.data?.type === "DEVMATE_GET_CONTEXT") {
    iframe.contentWindow.postMessage({
      type: "DEVMATE_CONTEXT_RESULT",
      requestId: event.data.requestId,
      context: collectContext()
    }, new URL(chrome.runtime.getURL("")).origin);
  }
});
