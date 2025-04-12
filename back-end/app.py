import os
from http.client import HTTPException

from flask import Flask,UploadFile,File
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from zeroconf import ServiceInfo, Zeroconf
import socket
from flask import request
app = Flask(__name__)
from conversion_service import run_ffmpeg_command
from tempfile import NamedTemporaryFile

class FFmpegRequest():
    input_file: str
    output_file: str


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
# @app.post('/ffmpeg-conversion')
# async def ffmpeg_conversion(request: FFmpegRequest):
#     input_file = request.input_file
#     output_file = request.output_file
#
#     if not os.path.isfile(input_file):
#         raise HTTPException(status_code=404, detail="Input file not found")
#
#     return run_ffmpeg_command(input_file, output_file)
@app.post('/ffmpeg-conversion')
async def ffmpeg_conversion(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename)[1]
        with NamedTemporaryFile(delete=False, suffix=suffix) as temp_input:
            input_path = temp_input.name
            contents = await file.read()
            temp_input.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {e}")

    output_path = f"{input_path}_converted.mp4"
    run_ffmpeg_command(input_path, output_path)
if __name__ == '__main__':
    register_mdns()
    socketio.run(app, host='0.0.0.0', port=3000)
