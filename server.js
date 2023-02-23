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
    store.collection('tracks').get().then(snapshot => {
        setupSite(snapshot.docs);
    });

    const setupSite = (data) => {
        data.forEach(doc => {
            const adv = doc.data();
            const li = `<div onclick="location.href='/${doc.id}';" title="Listen to ${adv.name}"><div class="slot"><div class="banner"><img class="banner-img" src="${adv.cover}"></div><div class="track-descriptors"><div class="track-desc"><div class="track-name">${adv.name}</div><div class="track-owner">${adv.uploader}</div></div></div></div></div>`;
            recommend += li;
        });
    }

    res.render('pages/index', {
        title: "Nothing's playing",
        source: ""
    });
});

app.get('/:id', function (req, res) {
    if(req.params.id === 'mobile.js') return; // for some reason the req.params.id keeps returning this 'mobile.js' value, so we're just gonna skip it.
    var toFind = req.params.id;
    var docRef = store.collection('tracks').doc(toFind);
    docRef.get().then((doc) => {
        if(doc.exists) {
            var title = `${doc.data().uploader} - ${doc.data().name}`;
            var source = doc.data().source;
        }

        // render meta
        res.render('pages/index', {
            // EJS v meta
            title: title,
            source: source
        });
    })
});