const express = require('express');
const ejs = require('ejs');
const port = process.env.port || 5500;

// kickstart express
const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Cache-Control", "no-cache");
    next();
});

app.use(express.static('public'));
app.set('view engine', 'ejs');

// listen to app
app.listen(port, function(){
    console.log('listening to some fire;' + port);
})

// a small let
let srcv = "";

app.get('/', function (req, res) {
    var title = "TallerThanShort - saiko-1";
    var source = srcv;
    // render meta
    res.render('pages/index', {
        // EJS v meta
        title: title,
        source: source
    });
});