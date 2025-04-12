import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import whisper
import torch
import librosa
import numpy as np
import os

# === LOAD WHISPER AND TRANSCRIBE AUDIO ===
MODEL_NAME = "base"  # smaller model to save GPU RAM
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model(MODEL_NAME).to(DEVICE)

AUDIO_FILE = "/home/fitia/devfest2024/devfest_mastermind/backend/output2.wav"

result = model.transcribe(AUDIO_FILE, fp16=(DEVICE=="cuda"), language="en")
print("Transcription:\n", result["text"])

# === LOAD AUDIO FOR EMOTION ANALYSIS ===
y, sr = librosa.load(AUDIO_FILE, sr=16000)

# Compute Mel Spectrogram
mel_spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)

# Resize or pad to fixed shape (for model input)
TARGET_SHAPE = (128, 128)
if mel_spec_db.shape[1] < TARGET_SHAPE[1]:
    pad_width = TARGET_SHAPE[1] - mel_spec_db.shape[1]
    mel_spec_db = np.pad(mel_spec_db, ((0, 0), (0, pad_width)), mode='constant')
else:
    mel_spec_db = mel_spec_db[:, :TARGET_SHAPE[1]]

mel_spec_db = mel_spec_db[np.newaxis, ..., np.newaxis]  # (1, 128, 128, 1)


# === DEFINE OR LOAD A PRETRAINED MODEL ===
# For demo: simple model structure (you can load a trained model too)
# def build_emotion_model():
#     model = tf.keras.Sequential([
#         tf.keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=(128,128,1)),
#         tf.keras.layers.MaxPooling2D(2,2),
#         tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
#         tf.keras.layers.MaxPooling2D(2,2),
#         tf.keras.layers.Flatten(),
#         tf.keras.layers.Dense(64, activation='relu'),
#         tf.keras.layers.Dense(4, activation='softmax')  # e.g. ['neutral', 'happy', 'sad', 'angry']
#     ])
#     return model
#
# emotion_model = build_emotion_model()
#
# # === LOAD PRETRAINED WEIGHTS IF AVAILABLE ===
# # emotion_model.load_weights("path/to/weights.h5")
#
# # === PREDICT EMOTION ===
# # (Note: Without trained weights, prediction will be random)
# emotion_labels = ['neutral', 'happy', 'sad', 'angry']
# preds = emotion_model.predict(mel_spec_db)
# pred_label = emotion_labels[np.argmax(preds)]
#
# print("Detected Emotion Based on Tone:", pred_label)
