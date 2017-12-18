'use strict';
var listenOnPort = 8082,
    debug = require('debug'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    request = require('request'),
    fs = require("fs"),
    extractor = require('unfluff'),
    emotional = require("emotional"),
    WordPOS = require('wordpos'),
    wordpos = new WordPOS();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.get('/stats', function (req, res) {
    var domain = req.get("host"), result = {};
    API_KEY = process.env.API_KEY;
    url = `developer.majestic.com/api/json?app_api_key=${API_KEY}&cmd=GetIndexItemInfo&items=1&item0=${domain}&datasource=fresh`;
    result.majestic = request.get(url, options, function (err, res, body) {
        if (err) {
            console.log("Get request failed: " + err);
            return false;
        }
        if (res.statusCode !== 200)
            try {
                data = JSON.parse(body);
                if (data['Code'] != 'OK') {
                    console.log("Error getting JSON from URL");
                    return false;
                } else {
                    majestic_data = data['DataTables']['Results']['Data'][0];
                    response_data = {
                        'CitationFlow': majestic_data['CitationFlow'],
                        'TrustFlow': majestic_data['TrustFlow'],
                        'Topic': majestic_data['TopicalTrustFlow_Topic_0'],
                        'TopicValue': majestic_data['TopicalTrustFlow_Value_0']
                    }
                    return response_data;
                }
            } catch (e) {
                console.log("Could not parse into JSON: " + data);
                return false;
            }
    });
    
    article = extractor.lazy(req.get("host"), 'en');
    result['Betteridge_legal'] = article.softTitle.substring(article.softTitle.length - 1) == "?";

    var grammar = wordpos.getPOS(article.text);
    result['Grammar'] = { 'Noun': grammar.noun.length, 'Verb': grammar.verb.length, 'Adjective': grammar.adjective.length, 'Adverb': grammar.adverb.length, 'Other': grammar.rest.length }

    emotional.load(function () {
        var text = emotional.get(article.text);
        result['Polarity'] = text.polarity;
        result['Subjectivity'] = text.subjectivity;
        var content_veracity_coefficient = 100 - (text.subjectivity / 2) - (text.polarity / 4);
        if (!result['Betteridge_legal'])
            content_veracity_coefficient /= 4;
        result['CVC'] = round(content_veracity_coefficient, 2)
    });    

    var votes = require("./votes.json");
    result['Votes'] = votes[domain].y / (votes[domain].y + votes[domain].n);

    var values = [result.majestic['CitationFlow'] || 0, result.majestic['TrustFlow'] || 0, result['CVC'] || 0, result['Votes'] || 0];
    result.overall = 0;
    for (var item in values) result.overall += item;
    result.overall /= values.length;
    switch (Math.floor(avg/15)) {
        case (0): result.overall = 'U'; break;
        case (1): result.overall = 'F'; break;
        case (2): result.overall = 'E'; break;
        case (3): result.overall = 'D'; break;
        case (4): result.overall = 'C'; break;
        case (5): result.overall = 'B'; break;
        default: result.overall = 'A'; break;
    }

    res.json(result);
});
app.get('/vote', function (req, res) {
    if (req.query.trusted == "y" || req.query.trusted == "n") {
        var votes = require("./votes.json");
        votes[req.get('host')][req.query.trusted]++;
        fs.writeFile("filename.json", JSON.stringify(votes), "utf8", function (err) {
            if (err) {
                console.log(err);
                res.send(false);
            }
            res.send(true);
        });
    } else res.send(false);
});
app.get('/', function (req, res) { res.sendFile(__dirname + '/index.html'); });
app.get('*', function (req, res) { res.sendFile(__dirname + '/public/error.html'); });
app.set('port', process.env.PORT || listenOnPort + 1);
http.listen(app.get('port'));