import requests
import json


def get_json(url):
    r = requests.get(url)
    print(r.status_code)
    if r.status_code != 200:
        raise Exception('Error getting JSON from URL')
    try:
        r_json = r.json()
    except json.decoder.JSONDecodeError:
        raise ValueError('API did not respond with valid JSON')
    if r_json['Code'] != 'OK':
        raise Exception('Error getting JSON from URL')
    return r_json


def get_stats(key):
    url = "https://developer.majestic.com/api/json" +\
          "?app_api_key=%s" +\
          "&cmd=GetIndexItemInfo" +\
          "&items=1" +\
          "&item0=coventry.ac.uk" +\
          "&datasource=fresh"
    url = url % key

    majestic_data = get_json(url)
    print(majestic_data)
    return majestic_data
