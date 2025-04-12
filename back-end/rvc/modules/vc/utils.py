import os

from fairseq import checkpoint_utils
import requests

def download_tahina_index_from_cloud(url, dest_path):
    """
    Downloads the Tahina index file from the cloud URL to the specified destination path.
    """
    print(f"Downloading Tahina index from {url} to {dest_path}...")
    response = requests.get(url, stream=True)
    response.raise_for_status()  # Ensure we don't silently ignore any errors
    with open(dest_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"Tahina index downloaded to {dest_path}")

def get_tahina_index_path(tahina_index_path=None):
    """
    Retrieves the path to the Tahina index file, downloading it from the cloud if necessary.
    """
    tahina_index_path = tahina_index_path or os.getenv("tahina_index_root", "./tahina/tahina.index")
    cloud_url = "https://github.com/N1A1voIt/Projet-Bee-z-nice/releases/download/1.0/tahina.index"  # Replace with your URL

    # Check if the file exists locally
    if not os.path.exists(tahina_index_path):
        os.makedirs(os.path.dirname(tahina_index_path), exist_ok=True)  # Create directories if needed
        download_tahina_index_from_cloud(cloud_url, tahina_index_path)

    return tahina_index_path

def get_index_path_from_model(sid):
    """
    Retrieves the index path from the model with the given sid.
    """
    index_root = get_tahina_index_path()
    # Ensure the file exists and the model's index can be found
    index_path = next(
        (
            f
            for f in [
                os.path.join(root, name)
                for root, _, files in os.walk(index_root, topdown=False)
                for name in files
                if name.endswith(".index") and "trained" not in name
            ]
            if str(sid).split(".")[0] in f
        ),
        "",
    )
    if not index_path:
        print(f"No index found for sid {sid} in {index_root}")
    return index_path

def load_hubert(config, hubert_path: str):
    print("HUBERT:",hubert_path)
    models, _, _ = checkpoint_utils.load_model_ensemble_and_task(
        [hubert_path],
        suffix="",
    )
    hubert_model = models[0]
    hubert_model = hubert_model.to(config.device)
    hubert_model = hubert_model.half() if config.is_half else hubert_model.float()
    return hubert_model.eval()
