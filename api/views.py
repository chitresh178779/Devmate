from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import google.generativeai as genai
import os

# --- CONFIGURATION ---
# 1. Get your API Key from: https://aistudio.google.com/app/apikey
# 2. Paste it below inside the quotes
GEMINI_API_KEY = "AIzaSyDRilB-2EqgLaKtgMw3VPEL97VsQvaCJ-k" 

# Configure the AI SDK
genai.configure(api_key=GEMINI_API_KEY)

class ChatView(APIView):
    def post(self, request):
        """
        This endpoint receives JSON data from the Chrome Extension:
        {
            "role": "Senior Python Engineer",
            "code_context": "def hello_world(): ...",
            "query": "Explain this code"
        }
        """
        
        # 1. Extract data from the request
        data = request.data
        role = data.get('role', 'Software Engineer')
        code_context = data.get('code_context', '')
        query = data.get('query', '')

        # Basic validation
        if not query:
            return Response(
                {"error": "No query provided. Please type a question."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Construct the System Prompt (The "Persona")
        # We limit context to 10,000 chars to fit within standard token limits safely
        system_prompt = f"""
        You are DevMate, an expert {role}.
        
        CONTEXT:
        The user is actively looking at this code snippet/file:
        ```
        {code_context[:10000]} 
        ```

        YOUR INSTRUCTIONS:
        1. Adopt the persona of a {role} (e.g., if Security Expert, focus on vulnerabilities).
        2. Answer the user's specific question: "{query}"
        3. Use Markdown for code blocks and formatting.
        4. Be concise but thorough.
        """

        try:
            # 3. Send to Gemini (Using the flash model for speed)
            model = genai.GenerativeModel('gemini-2.5-flash') 
            
            # Generate content
            response = model.generate_content(system_prompt)
            
            # 4. Return the text back to the Chrome Extension
            return Response({
                "response": response.text,
                "role_used": role
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Log error to console for debugging
            print(f"Gemini API Error: {e}")
            return Response(
                {"error": f"AI Error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )