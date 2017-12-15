import requests
import json
import operator
import re
import sys
import urllib

import nltk
import requests
from bs4 import BeautifulSoup
from textblob import TextBlob

from flask import Flask, request, jsonify
import os
import json
from article_analysis import nlp

import majestic

app = Flask(__name__)


api_key_name = "MAJESTIC_API_KEY"
API_KEY = os.environ[api_key_name]
print("%s: %s" % (api_key_name, API_KEY))

def get_json(url):
    r = requests.get(url)
    if r.status_code != 200:
        raise Exception('Error getting JSON from URL')
    try:
        r_json = r.json()
    except json.decoder.JSONDecodeError:
        raise ValueError('API did not respond with valid JSON')
    if r_json['Code'] != 'OK':
        raise Exception('Error getting JSON from URL')
    return r_json


def get_stats(key, search):
    url = "https://developer.majestic.com/api/json" +\
          "?app_api_key=%s" +\
          "&cmd=GetIndexItemInfo" +\
          "&items=1" +\
          "&item0=%s" +\
          "&datasource=fresh"
    url = url % (key, search)

    majestic_data = get_json(url)['DataTables']['Results']['Data'][0]

    response_data = {
        'CitationFlow': majestic_data['CitationFlow'],
        'TrustFlow': majestic_data['TrustFlow'],
        'Topic': majestic_data['TopicalTrustFlow_Topic_0'],
        'TopicValue': majestic_data['TopicalTrustFlow_Value_0']
    }

    return response_data

def get_article(url):
    try:
        html = urllib.request.urlopen(url).read()
    except:
        return ""
    soup = BeautifulSoup(html, 'lxml')

    for script in soup(["script", "style"]):
        script.extract()

    text = soup.get_text()
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)
    cuttings = text.split('\n')

    main_cuts = [cut for cut in cuttings if len(cut) > 100]

    article = '\n'.join(main_cuts)
    return article

punctuation = list('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~')
punctuation.extend(['\'\'', '``'])

def get_grammar_census(url):
    article_tokens = nltk.word_tokenize(get_article(url))
    article_tagged = nltk.pos_tag(article_tokens)  # parts of speech
    grammar = {}
    for word in article_tagged:
        if word[1] not in punctuation:
            if word[1] not in grammar:
                grammar[word[1]] = 1
            else:
                grammar[word[1]] += 1

    basic_grammar = {'Noun': 0, 'Verb': 0, 'Adjective': 0, 'Adverb': 0, 'Other': 0}
    for word_type in grammar:
        if word_type[0] == 'N':
            basic_grammar['Noun'] += grammar[word_type]
        elif word_type[0] == 'V':
            basic_grammar['Verb'] += grammar[word_type]
        elif word_type[0] == 'J':
            basic_grammar['Adjective'] += grammar[word_type]
        elif word_type[0] == 'R':
            basic_grammar['Adverb'] += grammar[word_type]
        else:
            basic_grammar['Other'] += grammar[word_type]

    grammar_total = sum(basic_grammar.values())
    for word_type in basic_grammar:
        basic_grammar[word_type] *= (100 / grammar_total)

    return basic_grammar


def remove_quotes(article):
    single_quotes = r'\[.*?\]'
    double_quotes = r'\(.*?\)'
    article = re.sub(single_quotes, '', article)
    article = re.sub(double_quotes, '', article)
    return article


def get_polarity(article):
    article_blob = TextBlob(article)
    polarity = abs(article_blob.sentiment.polarity) * 100
    return polarity


def get_subjectivity(article):
    article_blob = TextBlob(article)
    subjectivity = abs(article_blob.sentiment.subjectivity) * 100
    return subjectivity


def betteridge_legal(url):
    article = requests.get(url)
    try:
        article.raise_for_status()
    except:
        return False
    soup = BeautifulSoup(article.text, 'lxml')
    header = soup.find('h1')
    try:
        if header.text[-1] == '?':
            return False
    except:
        return False
    return True


def dict_from_list(iterable):
    result = {}
    for value in iterable:
        result[value[0]] = value[1]
    return result


def article_stats(url):
    article_stats = {}
    article = get_article(url)
    gram_dict = get_grammar_census(BBC_chatbot_love)
    gd_sorted = sorted(gram_dict.items(), key=operator.itemgetter(1), reverse=True)
    article_stats['Grammar'] = dict_from_list(gd_sorted)
    article_no_quotes = remove_quotes(article)
    article_stats['Polarity'] = round(get_polarity(article_no_quotes), 2)
    article_stats['Subjectivity'] = round(get_subjectivity(article_no_quotes), 2)
    article_stats['Betteridge_legal'] = betteridge_legal(url)

    content_veracity_coefficient = 100 - (article_stats['Subjectivity'] / 2) - (article_stats['Polarity'] / 4)
    if not article_stats['Betteridge_legal']:
        content_veracity_coefficient /= 4

    article_stats['CVC'] = round(content_veracity_coefficient, 2)
    return article_stats


if __name__ == '__main__':
    print(article_stats(str(sys.argv[1])))

	
	
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
def accept_vote_v1():
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


@app.route("/vote/v2")
def accept_vote_v2():
    url = request.args.get('url')

    try:
        vote_stat = vote_stats(domain_from_url(url.replace('www.', '')))
    except:
        vote_stat = 0

    try:
        trusted_param = request.args.get('trusted').lower()[0]
    except:
        return jsonify({
            "Status": "Error",
            "VoteStat": vote_stat
        }), 400
    trusted = -1

    if trusted_param == 'y':
        trusted = 1
    if trusted_param == 'n':
        trusted = 0

    if trusted == -1:
        return jsonify({
            "Status": "Error",
            "VoteStat": vote_stat
        }), 400

    domain = domain_from_url(url).replace('www.', '')

    edit_votes(domain, trusted_param)

    try:
        vote_stat = vote_stats(domain_from_url(url.replace('www.', '')))
    except:
        vote_stat = 0

    return jsonify({
        "Status": "OK",
        "VoteStat": vote_stat
    }), 200


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
