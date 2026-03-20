import os
import base64
import io
from PIL import Image

try:
    from google import genai
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key) if api_key else None
except ImportError:
    client = None

def analyze_liveness_and_spoofing(image_base64: str) -> bool:
    """
    Uses Gemini to analyze the face image for spoofing artifacts.
    """
    if not client:
        # Mock success if Gemini isn't configured for easy local testing
        print("Warning: GEMINI_API_KEY not set. Skipping real spoofing check.")
        return True
        
    try:
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        prompt = "Analyze this image containing a person's face. Is there any evidence that this is a spoofed image? For example, is it a photo of a screen, a photo of a printed photo, or a mask? Just reply with genuine or spoof."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image, prompt]
        )
        
        result = response.text.strip().lower()
        if "spoof" in result:
            return False
        return True
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return False
