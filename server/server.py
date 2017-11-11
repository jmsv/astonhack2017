from flask import Flask
import os

import majestic

app = Flask(__name__)


api_key_name = "MAJESTIC_API_KEY"
API_KEY = os.environ[api_key_name]
print("%s: %s" % (api_key_name, API_KEY))


@app.route("/hello")
def hello():
    return "Hello World!"


na = majestic.get_stats(API_KEY)
