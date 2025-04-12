import os
from http.client import HTTPException

from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from zeroconf import ServiceInfo, Zeroconf
import socket
from flask import request
app = Flask(__name__)
from conversion_service import run_ffmpeg_command

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
@app.post('/ffmpeg-conversion')
async def ffmpeg_conversion(request: FFmpegRequest):
    input_file = request.input_file
    output_file = request.output_file

    if not os.path.isfile(input_file):
        raise HTTPException(status_code=404, detail="Input file not found")

    return run_ffmpeg_command(input_file, output_file)
if __name__ == '__main__':
    register_mdns()
    socketio.run(app, host='0.0.0.0', port=3000)
