import os
import base64
import io
import json
from PIL import Image

try:
    from google import genai
    from google.genai import types
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key) if api_key else None
except ImportError:
    client = None

def analyze_liveness_and_spoofing(image_base64: str) -> bool:
    """
    Uses Gemini to analyze the face image for spoofing artifacts.
    Returns True if genuine, False if spoofed or error occurs.
    """
    if not client:
        # Mock success if Gemini isn't configured for easy local testing
        print("Warning: GEMINI_API_KEY not set. Skipping real spoofing check.")
        return True
        
    try:
        # Clean up base64 string if it contains the data prefix
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        # Structure the prompt to be highly specific and request a consistent format
        prompt = """
        ACT AS A SECURITY ANALYST specializing in biometric authentication.
        SYSTEM TASK: Analyze the provided facial image for 'Presentation Attacks' (Spoofing).
        
        CHECK FOR:
        1. Screen reflection or moiré patterns (photo of a laptop/phone).
        2. Paper edges or unnatural shadows (printed photo).
        3. Eye/mouth holes or stiff textures (masks).
        4. Consistency in lighting and depth.
        
        OUTPUT FORMAT: Provide a JSON object with 'is_genuine' (boolean) and 'confidence_score' (float 0.0-1.0).
        NO OTHER TEXT.
        """
        
        response = client.models.generate_content(
            model='gemini-2.0-flash', # Using flash for speed/cost efficiency in live polling
            contents=[image, prompt],
            config=types.GenerateContentConfig(
                response_mime_type='application/json'
            )
        )
        
        if not response or not response.text:
            return False

        result = json.loads(response.text)
        is_genuine = result.get('is_genuine', False)
        confidence = result.get('confidence_score', 0.0)
        
        # We only accept genuine results with high confidence
        return is_genuine and confidence > 0.7

    except Exception as e:
        print(f"Gemini analysis error: {e}")
        # In a real voting scenario, we might want to flag this for manual review
        return False
