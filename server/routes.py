from flask import jsonify, request
import requests
import os


def get_weather_route(app):
    @app.route('/weather', methods=['GET'])
    def get_weather():
        city = request.args.get('city')
        if not city:
            return jsonify({"error": "City is required"}), 400
        
        api_key = os.getenv("api_key")  
        weather_url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}'
        
        try:
            response = requests.get(weather_url)
            data = response.json()
            if response.status_code == 200:
                return jsonify(data)
            else:
                return jsonify({"error": "Weather data not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
