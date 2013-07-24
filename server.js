var express = require('express'),
    app = express(),
    restler = require('restler');
  
app.use(express.static(__dirname));
app.use(express.static("js"));
app.use(express.static("css"));
app.use(express.static("lib"));
app.use(express.static("images"));

app.get('/apiProxy/:uri',function(req, res){

    var request = req.params.uri;

    restler.get('http://api.reittiopas.fi/' + request, {})
        .on('complete', function(data) {
            res.json(data);
        });
});