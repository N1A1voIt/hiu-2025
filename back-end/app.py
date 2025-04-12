import os

from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from werkzeug.utils import secure_filename
from zeroconf import ServiceInfo, Zeroconf
import socket
from flask import request
import firebase_admin
from firebase_admin import credentials, firestore

from facedetection.login import login
from facedetection.recognition import vectorize_image

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def on_connect():
    sid = request.sid
    print(f"Client connected with SID: {sid}")

@socketio.on('clipboard')
def handle_clipboard(data):
    print(" Data thrown:", data)
    emit('clipboard', data, broadcast=True, include_self=False)

def register_mdns():
    desc = {'path': '/'}
    local_ip = socket.gethostbyname(socket.gethostname())
    info = ServiceInfo(
        "_http._tcp.local.",
        "ClipboardServer._http._tcp.local.",
        addresses=[socket.inet_aton(local_ip)],
        port=3000,
        properties=desc,
        server="clipboard.local."
    )
    zeroconf = Zeroconf()
    zeroconf.register_service(info)

    print(f"[mDNS] Registered clipboard.local on {local_ip}")

cred = credentials.Certificate("env/credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/families', methods=['GET'])
def get_families():
    families_ref = db.collection('families')
    docs = families_ref.stream()
    families = [doc.id for doc in docs]
    return jsonify(families)

@app.route('/api/register', methods=['POST'])
def register_user():
    try:
        name = request.form.get('name')
        family = request.form.get('family')
        photo = request.files.get('photo')

        if not name or not family or not photo:
            return jsonify({'error': 'Missing required fields'}), 400

        photo_filename = secure_filename(photo.filename)
        photo_path = os.path.join(app.config['UPLOAD_FOLDER'], photo_filename)
        photo.save(photo_path)

        face_data = vectorize_image(photo_path)
        print(type(face_data))
        if not face_data:
            return jsonify({'error': 'No faces detected in the photo'}), 400

        family_ref = db.collection('families').document(family)
        family_doc = family_ref.get()

        if not family_doc.exists:
            family_ref.set({
                'familyName': family
            })

        user_ref = family_ref.collection('users').document(name)
        user_doc = user_ref.get()

        if user_doc.exists:
            return jsonify({'error': f'User {name} already exists in family {family}'}), 400
        serialized_face_data = [embedding.tolist() for embedding in face_data]
        print(serialized_face_data)
        user_ref.set({
            'name': name,
            'photo': photo_filename,
            'faceData': serialized_face_data[0]
        })

        return jsonify({'message': f'User {name} added successfully to family {family}'}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
@app.post('/api/login')
def login_controller():
    photo = request.files.get('photo')
    if not photo:
        return jsonify({'error': 'Missing required fields'}), 400
    return login(photo,db)

if __name__ == '__main__':
    register_mdns()
    socketio.run(app, host='0.0.0.0', port=3000)
