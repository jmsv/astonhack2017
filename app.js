'use strict';
require('dotenv-safe').load();
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
    var url = new URL(decodeURIComponent(req.query.url)),
        result = {},
        options = {
            app_api_key: process.env.API_KEY,
            cmd: "GetIndexItemInfo",
            items: 1,
            item0: url.href,
            datasource: "fresh"
        };
    request({ url: `http://developer.majestic.com/api/json`, qs: options }, function (err, res, body) {
        if (err)
            console.log("Get request failed: " + err);
        if (res.statusCode !== 200)
            try {
                data = JSON.parse(body);
                if (data['Code'] !== 'OK')
                    console.log("Error getting JSON from URL");
                else {
                    var majestic_data = data['DataTables']['Results']['Data'][0];
                    result['CitationFlow'] = majestic_data['CitationFlow'];
                    result['TrustFlow'] = majestic_data['TrustFlow'];
                    result['Topic'] = majestic_data['TopicalTrustFlow_Topic_0'];
                    result['TopicValue'] = majestic_data['TopicalTrustFlow_Value_0'];
                }
            } catch (e) {
                console.log("Could not parse into JSON: " + data);
            }
    });
    
    var article = extractor.lazy(req.get("host"), 'en');
    if (article) {
        var title = article.softTitle.toString();
        result['Betteridge_legal'] = title.substring(title.length - 1) !== "?";
        
        wordpos.getPOS(article.text(), function (res) {
            result['Grammar'] = { 'Noun': res.nouns.length, 'Verb': res.verbs.length, 'Adjective': res.adjectives.length, 'Adverb': res.adverbs.length, 'Other': res.rest.length };
        });
        
        emotional.load(function () {
            var text = emotional.get(article.text());
            result['Polarity'] = text.polarity;
            result['Subjectivity'] = text.subjectivity;
            result['CVC'] = 100 - text.subjectivity / 2 - text.polarity / 4;
            if (!result['Betteridge_legal'])
                result['CVC'] /= 4;
        });
    }

    var votes = require("./votes.json"), domain = url.hostname;
    if (votes[domain]) result['Votes'] = votes[domain].y / (votes[domain].y + votes[domain].n);

    var values = [result['CitationFlow'] || 0, result['TrustFlow'] || 0, result['CVC'] || 0, result['Votes'] || 0];
    
    result.overall = 0;
    for (var i in values)
        result.overall += values[i];
    result.overall /= 4;
    
    switch (Math.floor(result.overall/15)) {
        case 0: result.overall = 'U'; break;
        case 1: result.overall = 'F'; break;
        case 2: result.overall = 'E'; break;
        case 3: result.overall = 'D'; break;
        case 4: result.overall = 'C'; break;
        case 5: result.overall = 'B'; break;
        default: result.overall = 'A'; break;
    }

    res.json(result);
});
app.get('/vote', function (req, res) { //many edits at once will be slow, use a variable and save every hour in case of crash
    if (req.query.trusted === "y" || req.query.trusted === "n") {
        var votes = require("./votes.json"),
            url = new URL(decodeURIComponent(req.query.url));
        votes[url.hostname][req.query.trusted]++;
        fs.writeFile("filename.json", JSON.stringify(votes), "utf8", function (err) {
            if (err) {
                console.log(err);
                res.send(false);
            }
            res.send(true);
        });
    } else res.send(false);
});
app.get('/', function (req, res) { res.sendFile(__dirname + '/public/index.html'); });
app.get('*', function (req, res) { res.sendFile(__dirname + '/public/error.html'); });
app.set('port', process.env.PORT || listenOnPort + 1);
http.listen(app.get('port'));