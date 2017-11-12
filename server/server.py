from flask import Flask, request, jsonify
import os
from article_analysis.nlp import article_stats

import majestic

app = Flask(__name__)


api_key_name = "MAJESTIC_API_KEY"
API_KEY = os.environ[api_key_name]
print("%s: %s" % (api_key_name, API_KEY))


def domain_from_url(url):
    try:
        domain = url.split('/')[2]
    except Exception:
        try:
            domain = url.split('/')[1]
        except Exception:
            try:
                domain = url.split('/')[0]
            except Exception:
                domain = url
    return domain


@app.route("/hello")
def hello():
    return "Hello World!"


@app.route("/v1")
def get_stats_v1():
    search = request.args.get('search')
    if not search:
        return 'Error', 400
    return jsonify(majestic.get_stats(API_KEY, search))


@app.route("/v2")
def get_stats_v2():
    search = request.args.get('search')
    if not search:
        return 'Error', 400
    maj_res = majestic.get_stats(API_KEY, search)
    try:
        aa_res = article_stats(search)
        response = {**maj_res, **aa_res}
    except ValueError:
        response = maj_res
    return jsonify(response)


@app.route("/v3")
def get_stats_v3():
    search = request.args.get('search')
    if not search:
        return 'Error', 400
    maj_search = search[:]
    maj_res = majestic.get_stats(API_KEY, maj_search)
    if maj_res['TrustFlow'] <= maj_res['CitationFlow'] <= 0:
        maj_search = domain_from_url(maj_search)
        maj_res = majestic.get_stats(API_KEY, maj_search)
    try:
        aa_res = article_stats(search)
        response = {**maj_res, **aa_res}
    except ValueError:
        response = maj_res
    return jsonify(response)
