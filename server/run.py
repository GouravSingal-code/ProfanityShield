from flask import Flask, Response, request
from flask_cors import CORS
from flask import jsonify


#app = Flask(__name__)  # Setup the flask app by creating an instance of Flask

app = Flask(__name__, static_folder='../src')
CORS(app)

@app.route('/')  # When someone goes to / on the server, execute the following function
def home():
    return 'Hello, World!'  # Return this message back to the browser

@app.route("/add", methods=["POST"], strict_slashes=False)
def receive_data():
    print('Recieved from client: {}'.format(request.data))
    with open('prrof_vocab.txt', 'r') as f:
        prof_vocab = [line.strip() for line in f]
    prof = False
    if text.__contains__('*'):
        prof = True
        
    for word in text:
        if prof_vocab.__contains__(word):
            prof = True
            break
    return jsonify({
        "prof":prof,
    })


if __name__ == '__main__':  # If the script that was run is this script (we have not been imported)
    print("server is starting")
    app.run()  # Start the server