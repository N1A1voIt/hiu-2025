from datetime import timedelta, datetime
from pathlib import Path
from scipy.io import wavfile
from transformers import VitsModel, AutoTokenizer
import torch
from rvc.modules.vc.modules import VC

# Load the model and tokenizer for Malagasy TTS
model = VitsModel.from_pretrained("facebook/mms-tts-mlg")
tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-mlg")
# Malagasy text input
text = "Ny lavalava dia akanjo malalaka amin'ny endriny, matetika vita amin'ny landy na lamba hafa, izay natao ho an'ny lehilahy na vehivavy.\n Amin'ny fomba fanao, ny lavalava dia entina amin'ny faritra ambany amin'ny vatana, avy eo dia amboarina sy arotsaka manodidina ny andilana. Raha vao mitafy lavalava ianao, dia afaka mandray endrika milamina sy mahafinaritra."

# Tokenize the text
inputs = tokenizer(text, return_tensors="pt")

# Generate speech waveform
with torch.no_grad():
    output = model(**inputs).waveform

# Save the waveform to a file or play it
waveform = output.numpy()

# Optional: Save as a .wav file
import soundfile as sf
sf.write("tmp.wav", waveform[0], 22050)


OUTPUT_DIR = Path("output_audio")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_rvc_model_with_index(vc: VC, pth_path: str, index_path: str = None):
    """
    Manually load RVC model with both .pth and .index file
    """
    if not Path(pth_path).exists():
        raise FileNotFoundError(f"Model file not found: {pth_path}")
    if index_path and not Path(index_path).exists():
        raise FileNotFoundError(f"Index file not found: {index_path}")

    # Custom logic to set model and index manually
    vc.get_vc(pth_path)  # Load the model (this initializes internal states)

    # Now manually override the index if applicable
    if index_path:
        vc.index_file = index_path  # Manually set the index path

    return vc
def process_audio(model_path, input_text, session_id):
    """
    Process audio for the REST API interaction.

    Parameters:
        model_path (str): Path to the voice conversion model.
        input_text (str): Text to synthesize.
        session_id (str): Unique session identifier.

    Returns:
        str: Path to the output audio file.
    """
    session_dir = OUTPUT_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    input_audio = session_dir / "input.wav"
    output_audio = session_dir / "output.wav"
    timestamp_file = session_dir / "timestamp.txt"

    model = VitsModel.from_pretrained("facebook/mms-tts-mlg")
    tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-mlg")
    inputs = tokenizer(input_text, return_tensors="pt")

    with torch.no_grad():
        output = model(**inputs).waveform

    waveform = output.numpy()[0]
    sf.write(input_audio, waveform, 22050)

    vc = VC()
    vc = load_rvc_model_with_index(vc, "tahina/tahina_experiment.pth", "tahina/tahina.index")
    tgt_sr, audio_opt, times, _ = vc.vc_inference(1, input_audio)

    if audio_opt is None:
        raise ValueError("Voice conversion failed. Check input audio or model setup.")

    wavfile.write(output_audio, tgt_sr, audio_opt)

    with open(timestamp_file, "w") as f:
        f.write(datetime.now().isoformat())

    return str(output_audio)

try:
    model_pathy = "tahina/tahina_experiment.pth"
    input_texty = text

    if not model_pathy or not input_texty:
        print("No model found")

    output_audio_path = process_audio(model_pathy, input_texty, "00test")

    audio_url = f"/download_audio/00test"

except Exception as e:
    print(e)
