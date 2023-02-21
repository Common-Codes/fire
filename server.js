const express = require('express');
const ejs = require('ejs');
const firebase = require('firebase');
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

// firebase kickstarter
const firebaseConfig = {
    apiKey: "AIzaSyAe15GQhLDMbLRscuVBSmVlww6cDklFGHc",
    authDomain: "fire-beatz.firebaseapp.com",
    projectId: "fire-beatz",
    storageBucket: "fire-beatz.appspot.com",
    messagingSenderId: "381673452839",
    appId: "1:381673452839:web:d70b595bf5b368e81ce502"
};
const dbapp = firebase.initializeApp(firebaseConfig);

const store = firebase.firestore();

app.get('/', function (req, res) {
    res.render('pages/index', {
        title: "Nothing's playing",
        source: ""
    });
});

app.get('/:id', function (req, res) {
    if(req.params.id === 'mobile.js') return;
    var toFind = req.params.id;
    var docRef = store.collection('tracks').doc(toFind);
    docRef.get().then((doc) => {
        if(doc.exists) {
            var title = doc.data().name;
            var source = doc.data().source;
            console.log(`${req.params.id} ${title} and ${source}`);
        }

        // render meta
        res.render('pages/index', {
            // EJS v meta
            title: title,
            source: source
        });
    })
});