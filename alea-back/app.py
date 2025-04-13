from flask import request, jsonify
from flask import Flask
from flask_cors import CORS

from corriger import corriger_phrase

app = Flask(__name__)
CORS(app)

@app.post('/api/corriger-phrase')
def corriger():
    data = request.get_json()
    print(data)
    suggestion = data['phrase']
    correction = corriger_phrase(suggestion)
    return jsonify({'data': correction})


if __name__ == '__main__':
    app.run(debug=True)