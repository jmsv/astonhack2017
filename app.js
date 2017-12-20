'use strict';
require('dotenv-safe').load();
var listenOnPort = 8082,
    votes = require('./votes.json'),
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
    unfluff = require('unfluff'),
    emotional = require("emotional"),
    WordPOS = require('wordpos'),
    wordpos = new WordPOS(),
    url = require('url');

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
    var uri = url.parse(decodeURIComponent(req.query.url)),
        result = {},
        waiting = 4,
        options = {
            app_api_key: process.env.API_KEY,
            cmd: "GetIndexItemInfo",
            items: 1,
            item0: uri.href,
            datasource: "fresh"
        };
    request({ url: `http://developer.majestic.com/api/json`, qs: options }, function (err, res, body) {
        if (err)
            console.log("Get request failed: " + err);
        if (res.statusCode == 200)
            try {
                data = JSON.parse(body);
                if (data['Code'] !== 'OK')
                    console.log("Majestic returned non-OK status");
                else {
                    var majestic_data = data['DataTables']['Results']['Data'][0];
                    result['CitationFlow'] = majestic_data['CitationFlow'];
                    result['TrustFlow'] = majestic_data['TrustFlow'];
                    result['Topic'] = majestic_data['TopicalTrustFlow_Topic_0'];
                    result['TopicValue'] = majestic_data['TopicalTrustFlow_Value_0'];
                }
            } catch (e) {
                console.log("Could not parse into JSON: " + body);
            }
        if (--waiting == 0) callback();
    });

    request({ method: 'GET', url: uri.href }, function (err, res, body) {
        if (err)
            console.log("Get request failed: " + err);
        if (res.statusCode == 200) {
            var article = unfluff(body, 'en');
            if (article) {
                var title = article.softTitle;
                result['Betteridge'] = title.substring(title.length - 1) !== "?";

                wordpos.getPOS(article.text, function (res) {
                    result['Grammar'] = { 'Nouns': res.nouns.length, 'Verbs': res.verbs.length, 'Adjectives': res.adjectives.length, 'Adverbs': res.adverbs.length, 'Other': res.rest.length };
                    if (--waiting == 0) callback();
                });

                emotional.load(function () {
                    var text = emotional.get(article.text);
                    result['Polarity'] = text.polarity * 100;
                    result['Subjectivity'] = text.subjectivity * 100;
                    result['CVC'] = 100 - result['Subjectivity'] / 2 - result['Polarity'] / 4;
                    if (!result['Betteridge'])
                        result['CVC'] /= 4;
                    if (--waiting == 0) callback();
                });
            }
        }
        if (--waiting == 0) callback();
    });

    var votes = require("./votes.json"), domain = uri.hostname.replace(/^www\./, '');
    if (votes[domain]) {
        result['VotesFor'] = votes[domain].y;
        result['VotesAgainst'] = votes[domain].n;
    }

    function callback() {
        console.log(result);
        res.json(result);
    }
});
app.get('/vote', function (req, res) { //many edits at once will be slow, use a variable and save every hour in case of crash
    if (req.query.trusted === "y" || req.query.trusted === "n") {
        var uri = url.parse(decodeURIComponent(req.query.url)).hostname.replace(/^www\./, '');
        votes[uri][req.query.trusted]++;
    } 
});
app.get('/', function (req, res) { res.sendFile(__dirname + '/public/index.html'); });
app.get('*', function (req, res) { res.sendFile(__dirname + '/public/error.html'); });
app.set('port', process.env.PORT || listenOnPort + 1);
http.listen(app.get('port'));

setInterval(function () {
    fs.writeFile("./votes.json", JSON.stringify(votes), "utf8", function (err) {
        if (err) console.log(err);
    });
}, 60 * 60 * 1000);