import os
import traceback

from flask import jsonify
from werkzeug.datastructures import FileStorage
from facedetection.recognition import vectorize_image
from user_dao.user_dao import get_all_users
from sklearn.metrics.pairwise import cosine_similarity

def login(photo: FileStorage,db):
    try:
        temp_filename = "temp_uploaded_photo.jpg"
        photo.save(temp_filename)

        unknown_picture_embedding = vectorize_image(temp_filename)
        if not unknown_picture_embedding:
            os.remove(temp_filename)
            return jsonify({'error': 'No face detected in the uploaded photo'}), 400

        users = get_all_users(db)

        threshold = 0.3
        best_match = None
        highest_similarity = 0
        for user in users:
            known_embeddings = user.get("faceData")  # Retrieve faceData; default to empty list if not found

            for unknown_embedding in unknown_picture_embedding:
                similarity = cosine_similarity([known_embeddings], [unknown_embedding])[0][0]
                if similarity > highest_similarity and similarity > threshold:
                    highest_similarity = similarity
                    best_match = {
                        "userName": user.get("userName"),
                        "family": user.get("family"),
                        "similarity": highest_similarity,
                        "photo": user.get("photo"),
                    }
        os.remove(temp_filename)

        if best_match:
            return jsonify({"message": "User matched successfully", "match": best_match}), 200
        else:
            return jsonify({"message": "No match found", "threshold": threshold}), 404

    except Exception as e:
        traceback.print_exc()
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


