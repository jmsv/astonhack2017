from flask import Flask
import os

app = Flask(__name__)


api_key_name = "MAJESTIC_API_KEY"
API_KEY = os.environ[api_key_name]
print("%s: %s" % (api_key_name, API_KEY))


@app.route("/")
def hello():
    return "Hello World!"
