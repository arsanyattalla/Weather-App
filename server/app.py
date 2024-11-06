from flask import Flask
import os
from routes import get_weather_route  
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

get_weather_route(app)

if __name__ == '__main__':
    app.run(debug=True)
