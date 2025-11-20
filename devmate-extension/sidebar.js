const messagesDiv = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const statusDiv = document.getElementById('status');
let currentContext = "";

// --- INIT ---
window.parent.postMessage({ type: "DEVMATE_GET_CONTEXT" }, "*");

window.addEventListener("message", (event) => {
  if (event.data.type === "DEVMATE_CONTEXT_RESULT") {
    currentContext = event.data.context;
    statusDiv.innerText = "Connected";
    statusDiv.classList.add("active");
  }
});

// --- SEND LOGIC ---
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

sendBtn.addEventListener('click', handleSend);

async function handleSend() {
  const text = input.value.trim();
  if (!text) return;

  // User Message
  addMessage("You", text, 'user');
  input.value = "";
  
  // AI Loading
  const loadingId = addLoading();

  try {
    const data = await chrome.storage.sync.get(['devMateRole']);
    const role = data.devMateRole || "Senior Engineer";

    // Ensure this URL matches your Django server!
    const response = await fetch('http://127.0.0.1:8000/api/chat/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: role,
        code_context: currentContext,
        query: text
      })
    });

    const result = await response.json();
    
    // Remove loading
    document.getElementById(loadingId).remove();
    
    // Add AI Response
    addMessage("DevMate", result.response, 'ai');

  } catch (e) {
    document.getElementById(loadingId).remove();
    addMessage("System", "Error: Brain disconnected. Is Python running?", 'ai');
  }
}

function addMessage(name, text, type) {
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  
  // If AI, use Markdown + Add Copy Buttons
  if (type === 'ai') {
    // Wrap content in a div for styling
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'ai-content';
    // Requires marked.js to be loaded in sidebar.html
    contentWrapper.innerHTML = marked.parse(text);
    div.appendChild(contentWrapper);
    
    messagesDiv.appendChild(div);
    
    // INJECT COPY BUTTONS
    addCopyButtons(contentWrapper);
  } else {
    div.innerText = text;
    messagesDiv.appendChild(div);
  }
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addLoading() {
  const id = "loading-" + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = "msg ai";
  div.innerHTML = `<div class="ai-content">Thinking...</div>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return id;
}

// --- THE MAGIC COPY FUNCTION ---
function addCopyButtons(element) {
  // Find all <pre> blocks (which contain <code>)
  const preBlocks = element.querySelectorAll('pre');

  preBlocks.forEach(pre => {
    // Create the button
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerText = 'Copy';

    // Add Click Event
    btn.addEventListener('click', () => {
      const code = pre.querySelector('code').innerText;
      
      // Copy to clipboard
      navigator.clipboard.writeText(code).then(() => {
        // Visual Feedback
        btn.innerText = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerText = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });

    // Append button to the <pre> block
    pre.appendChild(btn);
  });
}