# **🤖 DevMate \- AI Coding Teammate**

**DevMate** is a context-aware Chrome Extension that brings an AI pair programmer directly into your browser. It eliminates "Alt-Tab Fatigue" by allowing you to debug, refactor, and analyze code on websites like GitHub, Replit, or StackOverflow without ever leaving the tab.

## **🚀 Features**

* **🧠 Role-Based AI:** Assign specific personas (e.g., *Security Auditor*, *Senior Backend Dev*, *React Specialist*) to get tailored advice.  
* **👀 Context-Aware:** Automatically scrapes and understands the code currently visible on your screen.  
* **⚡ Powered by Gemini:** Uses Google's **Gemini 2.0 Flash** model for ultra-low latency responses.  
* **🎨 VS Code Aesthetic:** A sleek, dark-mode sidebar that feels like a native IDE.  
* **🛠️ Power Tools:**  
  * Resizable sidebar width.  
  * Syntax highlighting.  
  * One-click "Copy Code" buttons.  
  * "Fire-and-Forget" instant activation.

## **🏗️ Tech Stack**

| Component | Technology |
| :---- | :---- |
| **Frontend** | Chrome Extension (Manifest V3), Vanilla JS, HTML, CSS |
| **Backend** | Python, Django, Django REST Framework (DRF) |
| **AI Model** | Google Gemini 2.0 Flash |
| **Styling** | Custom VS Code Dark Theme |

## **🛠️ Installation Guide**

### **Part 1: The Brain (Backend)**

1. **Clone the repository:**

   ```bash
   git clone https://github.com/chitresh178779/Devmate.git
   cd Devmate
   ```

2. **Create and activate a virtual environment:**

   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the project root (same level as `manage.py`) and add your Google Gemini API key:

   ```env
   GEMINI_API_KEY=your_api_key_here
   DEBUG=True
   SECRET_KEY=django-insecure-dev-key
   ```

   🔑 **Get your key here:** [Google AI Studio](https://aistudio.google.com/app/apikey)

5. **Run the server:**

   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

   *Keep this terminal window open\!*

### **Part 2: The Body (Chrome Extension)**

1. Open Google Chrome and navigate to chrome://extensions.  
2. Toggle **Developer Mode** (top right corner).  
3. Click **Load Unpacked**.  
4. Select the **devmate-extension** folder from this project.  
5. **DevMate** should now appear in your extensions list\!

## **🕹️ How to Use**

1. **Navigate to a code repository** (e.g., any GitHub file page).  
2. **Refresh the page** (Important for the first load).  
3. Click the **DevMate Puzzle Icon** in your browser toolbar.  
4. Select a **Role** (e.g., *Senior Python Engineer*).  
5. Click **Activate Sidebar**.  
6. The sidebar will slide out. Ask questions like:  
   * *"Explain this logic."*  
   * *"Refactor this function to be O(n)."*  
   * *"Find security vulnerabilities."*

## **🔧 Troubleshooting**

**"Connection failed" or Sidebar doesn't respond?**

* Ensure your Django server is running at http://127.0.0.1:8000.  
* Check that you have configured CORS\_ALLOW\_ALL\_ORIGINS \= True in your Django settings.

**"Uncaught (in promise) Error"?**

* This usually happens if you try to open the sidebar on a restricted page (like the Chrome Web Store or a New Tab). Try it on a real website like GitHub.

**Icons missing?**

* Ensure you have the icons/ folder inside devmate-extension with icon16.png, icon48.png, and icon128.png.

## **🗺️ Roadmap**

* \[ \] **Write Access:** Ability to create Pull Requests directly from the sidebar.  
* \[ \] **Multi-File Context:** Reading the entire file tree instead of just the active file.  
* \[ \] **Voice Mode:** Talk to your AI teammate using speech-to-text.  
* \[ \] **Local LLM Support:** Option to switch to Ollama/Llama 3 for privacy.

## **🤝 Contributing**

Contributions are welcome\! Please open an issue or submit a pull request for any improvements.

1. Fork the Project  
2. Create your Feature Branch (git checkout \-b feature/AmazingFeature)  
3. Commit your Changes (git commit \-m 'Add some AmazingFeature')  
4. Push to the Branch (git push origin feature/AmazingFeature)  
5. Open a Pull Request

## **📄 License**

Distributed under the MIT License. See LICENSE for more information.
