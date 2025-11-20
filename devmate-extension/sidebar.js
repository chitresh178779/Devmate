const messagesDiv = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const statusDiv = document.getElementById('status');
let currentContext = "";

// 1. Ask Parent (Content Script) for the page code
window.parent.postMessage({ type: "DEVMATE_GET_CONTEXT" }, "*");

// 2. Receive the page code
window.addEventListener("message", (event) => {
  if (event.data.type === "DEVMATE_CONTEXT_RESULT") {
    currentContext = event.data.context;
    statusDiv.innerText = "Ready";
    statusDiv.classList.add("active");
  }
});

// 3. Send Message Logic
sendBtn.addEventListener('click', handleSend);

async function handleSend() {
  const text = input.value.trim();
  if (!text) return;

  // Show User Message
  addMessage("You", text, 'user');
  input.value = "";
  
  // Show Loading
  addMessage("DevMate", "Thinking...", 'ai', 'loading-msg');

  try {
    // Get Role from settings
    const data = await chrome.storage.sync.get(['devMateRole']);
    const role = data.devMateRole || "Senior Engineer";

    // CALL YOUR LOCAL DJANGO BACKEND
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
    
    // Remove loading and show AI response
    document.getElementById('loading-msg').remove();
    addMessage("DevMate", result.response, 'ai');

  } catch (e) {
    document.getElementById('loading-msg').remove();
    addMessage("System", "Error: Check if Django is running.", 'ai');
  }
}

function addMessage(name, text, type, id=null) {
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  if(id) div.id = id;
  
  const content = type === 'ai' ? marked.parse(text) : text;
  div.innerHTML = `<span class="msg-role">${name}</span>` + content;
  
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}