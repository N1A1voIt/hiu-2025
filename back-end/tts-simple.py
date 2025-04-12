from datetime import datetime
from pathlib import Path
from transformers import VitsModel, AutoTokenizer
import torch
import soundfile as sf

# Set up output path
OUTPUT_DIR = Path("output_audio/00test")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def generate_tts(text: str, output_path: Path):
    """
    Generate speech from text using Facebook MMS TTS for Malagasy.

    Parameters:
        text (str): Input text in Malagasy.
        output_path (Path): Path to save the generated .wav file.
    """
    print("🔊 Generating TTS...")

    # Load TTS model + tokenizer
    model = VitsModel.from_pretrained("facebook/mms-tts-mlg")
    tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-mlg")

    # Tokenize input
    inputs = tokenizer(text, return_tensors="pt")

    # Generate audio
    with torch.no_grad():
        output = model(**inputs).waveform

    waveform = output.numpy()[0]  # shape: (samples,)

    # Save to file
    sf.write(output_path, waveform, 22050)
    print(f"✅ TTS saved to: {output_path}")


if __name__ == "__main__":
    input_text = (
        "Ny lavalava dia akanjo malalaka amin'ny endriny, matetika vita amin'ny landy na lamba hafa, izay natao ho an'ny lehilahy na vehivavy."
    )

    output_wav = OUTPUT_DIR / "input.wav"

    generate_tts(input_text, output_wav)
