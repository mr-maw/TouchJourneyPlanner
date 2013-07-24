var express = require('express'),
    app = express(),
    restler = require('restler');

app.use(express.logger());


app.use(express.static(__dirname));
app.use(express.static("js"));
app.use(express.static("css"));
app.use(express.static("lib"));
app.use(express.static("images"));

app.get('/apiProxy/*',function(req, res){

    var request = req.url.replace('/apiProxy/','/');
    
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