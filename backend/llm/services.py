"""
Gemini API Service
Handles integration with Google Gemini API
"""

import json
import os
from typing import Dict, List, Optional

try:
    from decouple import config
    USE_DECOUPLE = True
except ImportError:
    USE_DECOUPLE = False

try:
    from google import genai
except ImportError:
    genai = None

# Get API key from environment variable
if USE_DECOUPLE:
    GEMINI_API_KEY = config('GEMINI_API_KEY', default=None)
    GEMINI_MODEL = config('GEMINI_MODEL', default='gemini-2.5-flash')
else:
    # Fallback to os.environ if decouple is not installed
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')


class GeminiService:
    """
    Service for interacting with Google Gemini API
    """
    
    def __init__(self):
        """Initialize Gemini client"""
        if genai is None:
            raise ImportError(
                "google-genai package not installed. "
                "Install it with: pip install google-genai"
            )
        
        if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
            raise ValueError(
                "GEMINI_API_KEY not configured. Please set it in backend/.env file or environment variable. "
                "Get your API key from: https://ai.google.dev/"
            )
        
        # Initialize client - it will use GEMINI_API_KEY from environment if not passed
        # But we'll pass explicitly to be sure
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model = GEMINI_MODEL
    
    def _build_prompt(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Combine system instruction with prompt when API does not accept system_instruction kwarg."""
        if system_instruction:
            return f"{system_instruction}\n\n{prompt}"
        return prompt

    def generate_content(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Generate content using Gemini API
        
        Args:
            prompt: The user prompt
            system_instruction: Optional system instruction for the model
            
        Returns:
            Generated text response
        """
        try:
            combined = self._build_prompt(prompt, system_instruction)
            response = self.client.models.generate_content(
                model=self.model,
                contents=combined
            )
            return response.text
        except Exception as e:
            raise Exception(f"Error calling Gemini API: {str(e)}")
    
    def generate_structured_content(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None,
        response_format: Optional[Dict] = None
    ) -> Dict:
        """
        Generate structured JSON content using Gemini API
        
        Args:
            prompt: The user prompt
            system_instruction: Optional system instruction
            response_format: Optional JSON schema for structured output
            
        Returns:
            Parsed JSON response
        """
        try:
            # Add instruction to return JSON
            json_prompt = f"{prompt}\n\nIMPORTANT: Return your response as valid JSON only, no additional text."
            
            if response_format:
                json_prompt += f"\n\nResponse format (JSON schema):\n{json.dumps(response_format, indent=2)}"
            
            response_text = self.generate_content(json_prompt, system_instruction)
            
            # Try to extract JSON from response
            # Sometimes Gemini wraps JSON in markdown code blocks
            response_text = response_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]  # Remove ```json
            if response_text.startswith('```'):
                response_text = response_text[3:]  # Remove ```
            if response_text.endswith('```'):
                response_text = response_text[:-3]  # Remove closing ```
            response_text = response_text.strip()
            
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse JSON response from Gemini: {str(e)}")
        except Exception as e:
            raise Exception(f"Error generating structured content: {str(e)}")
    
    def chat(
        self, 
        message: str, 
        conversation_history: Optional[List[str]] = None,
        system_instruction: Optional[str] = None
    ) -> str:
        """
        Chat with Gemini (conversational context)
        
        Args:
            message: Current user message (can include full conversation context as formatted string)
            conversation_history: Optional list of formatted history strings (for backward compatibility)
            system_instruction: Optional system instruction
            
        Returns:
            Assistant response
        """
        try:
            combined = self._build_prompt(message, system_instruction)
            response = self.client.models.generate_content(
                model=self.model,
                contents=combined
            )
            return response.text
        except Exception as e:
            raise Exception(f"Error in chat with Gemini: {str(e)}")


# Singleton instance
_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """Get or create Gemini service instance"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service

