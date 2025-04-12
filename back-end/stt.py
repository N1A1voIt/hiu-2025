import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import whisper
import torch

MODEL_NAME = "turbo"
DEVICE     = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model(MODEL_NAME).to(DEVICE)

# le ffmpeg teo no ahafahana mapiasa mp3 eto fa ra WAV de tsy mila an'iny fa tokony tode mande
result = model.transcribe(
    "/home/fitia/devfest2024/devfest_mastermind/backend/output2.wav",
    fp16=(DEVICE=="cuda"),
    language="en"
)

print(result["text"])