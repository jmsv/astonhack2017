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


def grade_from_trust_flow(trust_flow):
    if type(trust_flow) != int:
        return 'N/A'
    if 90 < trust_flow <= 100:
        return 'A'
    if 80 < trust_flow <= 90:
        return 'B'
    if 70 < trust_flow <= 80:
        return 'C'
    if 60 < trust_flow <= 70:
        return 'D'
    if 50 < trust_flow <= 60:
        return 'E'
    if 40 < trust_flow <= 50:
        return 'F'
    return 'N/A'


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


@app.route("/v4")
def get_stats_v4():
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
    response['Grade'] = grade_from_trust_flow(maj_res['TrustFlow'])
    return jsonify(response)
