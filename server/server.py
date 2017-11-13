from flask import Flask, request, jsonify
import os
import json
from article_analysis import nlp

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


def grade_from_values(values):
    avg = int(sum(values) / float(len(values)))
    if type(avg) != int:
        return 'N/A'
    if 85 < avg <= 100:
        return 'A'
    if 70 < avg <= 85:
        return 'B'
    if 55 < avg <= 70:
        return 'C'
    if 40 < avg <= 55:
        return 'D'
    if 25 < avg <= 40:
        return 'E'
    if 10 <= avg <= 25:
        return 'F'
    return 'U'


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
        aa_res = nlp.article_stats(search)
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
        aa_res = nlp.article_stats(search)
        response = {**maj_res, **aa_res}
    except ValueError:
        response = maj_res
    return jsonify(response)


@app.route("/v4")
def get_stats_v4():
    try:
        search = request.args.get('search')
        if not search:
            return "Error", 400
    except:
        return "Error", 400

    add_http = True
    if 'http' in search:
        if search.index('http') == 0:
            add_http = False
    if add_http:
        search = 'http://' + search

    maj_search = search[:]
    maj_res = majestic.get_stats(API_KEY, maj_search)
    if maj_res['TrustFlow'] <= maj_res['CitationFlow'] <= 0:
        maj_search = domain_from_url(maj_search)
        maj_res = majestic.get_stats(API_KEY, maj_search)
    try:
        aa_res = nlp.article_stats(search)
        response = {**maj_res, **aa_res}
    except ValueError:
        response = maj_res

    try:
        response['VoteStat'] = vote_stats(domain_from_url(search.replace('www.', '')))
    except:
        response['VoteStat'] = 0

    score_vals = [maj_res['TrustFlow']]
    try:
        score_vals.append(response['CVC'])
    except:
        pass

    if response['VoteStat'] > 0:
        score_vals.append(response['VoteStat'])
    response['Grade'] = grade_from_values(score_vals)

    return jsonify(response)


def edit_votes(domain, trusted):
    with open("votes.json", "r") as jsonFile:
        data = json.load(jsonFile)

    try:
        json_domain = data[domain]
    except Exception:
        data[domain] = {
            'y': 0,
            'n': 0
        }
    data[domain][trusted] = int(data[domain][trusted] + 1)

    with open("votes.json", "w") as jsonFile:
        json.dump(data, jsonFile)


@app.route("/vote/v1")
def accept_vote():
    url = request.args.get('url')
    try:
        trusted_param = request.args.get('trusted').lower()[0]
    except:
        return jsonify({'Status': "Error"}), 400
    trusted = -1

    if trusted_param == 'y':
        trusted = 1
    if trusted_param == 'n':
        trusted = 0

    if trusted == -1:
        return jsonify({'Status': "Error"}), 400

    domain = domain_from_url(url).replace('www.', '')

    edit_votes(domain, trusted_param)
    return jsonify({'Status': "OK"}), 200


def vote_stats(domain):
    with open("votes.json", "r") as jsonFile:
        data = json.load(jsonFile)
    try:
        js_d = data[domain]
    except:
        return 0
    score = js_d['y'] * 100.0 / (js_d['y'] + js_d['n'])
    return int(score)


@app.route("/vote-stats")
def get_vote_stats():
    try:
        search = request.args.get('url')
    except:
        return "Error, endpoint requires URL param: 'url'", 400
    try:
        result = vote_stats(domain_from_url(search.replace('www.', '')))
    except:
        result = 0

    return jsonify({'VoteStat': result}), 200
