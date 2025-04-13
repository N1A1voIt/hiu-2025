from flask import request
from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.post('/api/corriger-phrase')
def corriger_phrase():
    suggestion = request.form.get('phrase')
    return corriger_phrase(suggestion)
