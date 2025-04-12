import os
import traceback
from io import BytesIO

import av
import librosa
import numpy as np
from pathlib import Path


def wav2(i, o, format):
    inp = av.open(i, "r")  # 'r' mode to read
    if format == "m4a":
        format = "mp4"
    out = av.open(o, "w", format=format)  # 'w' mode to write
    if format == "ogg":
        format = "libvorbis"
    if format == "mp4":
        format = "aac"

    ostream = out.add_stream(format)

    for frame in inp.decode(audio=0):
        for p in ostream.encode(frame):
            out.mux(p)

    for p in ostream.encode(None):
        out.mux(p)

    out.close()
    inp.close()


def audio2(i, o, format, sr):
    inp = av.open(i, "r")  # 'r' mode to read
    out = av.open(o, "w", format=format)  # 'w' mode to write
    if format == "ogg":
        format = "libvorbis"
    if format == "f32le":
        format = "pcm_f32le"

    # Specify stream parameters when adding the audio stream
    ostream = out.add_stream(format)
    ostream.sample_rate = sr

    for frame in inp.decode(audio=0):
        for p in ostream.encode(frame):
            out.mux(p)

    out.close()
    inp.close()


def load_audio(file, sr):
    print(f"Loading file: {file}")

    if isinstance(file, Path):
        file = str(file)  # Convert Path to string if necessary

    if not os.path.exists(file):
        raise RuntimeError(
            "The audio path does not exist, please fix it!"
        )

    try:
        with open(file, "rb") as f:
            with BytesIO() as out:
                audio2(f, out, "f32le", sr)
                return np.frombuffer(out.getvalue(), np.float32).flatten()

    except AttributeError:
        # Handle non-Path audio objects (likely numpy array or other)
        if isinstance(file, np.ndarray):
            audio = file / 32768.0  # Normalize if numpy array
        else:
            raise TypeError(f"Unsupported input type: {type(file)}")

        if len(audio.shape) == 2:
            audio = np.mean(audio, -1)  # Convert stereo to mono
        return librosa.resample(audio, orig_sr=sr, target_sr=16000)

    except Exception:
        raise RuntimeError(traceback.format_exc())
