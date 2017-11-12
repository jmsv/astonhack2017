from flask import Flask, request, jsonify
import os

import majestic

app = Flask(__name__)


api_key_name = "MAJESTIC_API_KEY"
API_KEY = os.environ[api_key_name]
print("%s: %s" % (api_key_name, API_KEY))


@app.route("/hello")
def hello():
    return "Hello World!"


@app.route("/v1")
def get_stats():
    search = request.args.get('search')
    if not search:
        return 'Error', 400
    return jsonify(majestic.get_stats(API_KEY, search))
