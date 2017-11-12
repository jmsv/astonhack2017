import requests
import json


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
