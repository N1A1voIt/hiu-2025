import json
from collections import defaultdict
import Levenshtein

with open("index.json") as f:
    data = json.load(f)  # expects a JSON list of strings

def corriger_mot(mot: str, dictionnaire: set, seuil: int = 2) -> str:
    if mot in dictionnaire:
        return mot

    meilleure_correction = mot
    distance_min = float('inf')

    for mot_ref in dictionnaire:
        if abs(len(mot_ref) - len(mot)) > seuil:
            continue
        d = Levenshtein.distance(mot, mot_ref)
        if d < distance_min and d <= seuil:
            distance_min = d
            meilleure_correction = mot_ref
            if d == 1:
                break  # close enough

    return meilleure_correction
def corriger_phrase(phrase: str, dictionnaire: set) -> str:
    mots = phrase.lower().split()
    return ' '.join(corriger_mot(mot, dictionnaire) for mot in mots)

print(corriger_phrase("Bojnour mosnieur abaissassionss",data))
