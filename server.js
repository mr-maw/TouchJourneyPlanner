var express = require('express'),
    app = express(),
    restler = require('restler');
    
var creds = require('./creds');

app.use(express.logger());

app.get('/server.js', function(req, res) {
    res.send('Nope.');
});
app.get('/creds.js', function(req, res) {
    res.send('Nope.');
});

app.use(express.static(__dirname));
app.use(express.static("js"));
app.use(express.static("css"));
app.use(express.static("lib"));
app.use(express.static("images"));

app.get('/apiProxy/*',function(req, res){

    var request = req.url.replace('/apiProxy/','/');
    request = request + "&user=" + creds.user + "&pass=" + creds.pass;
    
    restler.get('http://api.reittiopas.fi/hsl/prod' + request, {})
        .on('complete', function(data) {
            console.log("request complete");
            if (data[0] === '<') {
                data = '{"error":"bad response", "serversaid":'+JSON.stringify(data)+'}';
            }
            data = JSON.parse(data);
            res.json(data);
        });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});