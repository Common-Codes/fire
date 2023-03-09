const express = require('express');
const ejs = require('ejs');
const firebase = require('firebase');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const port = process.env.port || 5500;

// kickstart express
const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Cache-Control", "no-cache");
    next();
});

//app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

// check auth status
function checkAuth(req, res, next) {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      const userRef = store.collection('users').doc(currentUser.uid);
      userRef.get().then(doc => {
        if (doc.exists) {
          req.username = doc.data().username;
        }
        next();
      });
    } else {
      next();
    }
  }

// login page
app.get('/auth', function (req, res) {
    res.render('pages/auth', {username: null});
});

// create new users
app.post('/auth/signup', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // User is authenticated
        const user = userCredential.user;
        const uid = user.uid;
        // create the users doc
        store.collection('users').doc(uid).set({
            username: req.body.username
        }).then(() => {
            // User data saved successfully
            res.status(200).send('OK');
          }).catch((error) => {
            // Error saving user data
            const errorMessage = error.message;
            console.error(errorMessage);
            res.status(500).send(errorMessage);
          });
      })
      .catch(error => {
        // Authentication failed
        const errorMessage = error.message;
        console.error(errorMessage);
        res.status(401).send(errorMessage);
      });
  });

// authorise existing user
app.post('/auth/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        // User is authenticated
        res.status(200).send('OK');
      })
      .catch(error => {
        // Authentication failed
        const errorMessage = error.message;
        console.error(errorMessage);
        res.status(401).send(errorMessage);
      });
  });

// load frontend
app.get('/', checkAuth, function (req, res) {
  const username = req.username;
  store.collection('tracks').get().then(snapshot => {
    const tracks = snapshot.docs.map(doc => doc.data());
    res.render('pages/index', {
      title: null,
      source: "",
      tracks: tracks,
      username: username
    });
  });
});

// upload tracks
app.get('/upload', checkAuth, function(req, res) {
    res.render('pages/upload', {
        title: "Upload a new Track",
        username: req.username
    })
});

app.post('/upload', function (req, res) {
  // check if file was uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
  }

  // get the file from the request
  const file = req.files.track;
  const filename = file.name;

  // create a new reference in Firebase Storage
  const storageRef = firebase.storage().ref(`tracks/${filename}`);

  // upload the file to Firebase Storage
  storageRef.put(file.data)
      .then(snapshot => {
          // get the download URL for the file
          storageRef.getDownloadURL()
              .then(url => {
                  // create a new document in the tracks collection with the download URL
                  store.collection('tracks').add({
                      name: req.body.name,
                      uploader: req.body.uploader,
                      source: url
                  })
                      .then(docRef => {
                          res.redirect('/');
                      })
                      .catch(error => {
                          console.error('Error adding document: ', error);
                          res.redirect('/upload');
                      });
              })
              .catch(error => {
                  console.error('Error getting download URL: ', error);
                  res.redirect('/upload');
              });
      })
      .catch(error => {
          console.error('Error uploading file: ', error);
          res.redirect('/upload');
      });
});

// play tracks
app.get('/:id', checkAuth, function (req, res) {
    const username = req.username;
    if(req.params.id === 'mobile.js') return; // for some reason the req.params.id keeps returning this 'mobile.js' value, so we're just gonna skip it.
    var toFind = req.params.id;
    const docRef = store.collection('tracks').doc(toFind);
    docRef.get().then((doc) => {
        if (doc.exists) {
        const title = `${doc.data().uploader} - ${doc.data().name}`;
        const source = doc.data().source;
        store.collection('tracks').get().then(snapshot => {
            const tracks = snapshot.docs.map(doc => doc.data());
            res.render('pages/index', {
            title: title,
            source: source,
            tracks: tracks,
            username: req.username
            });
        });
        } else {
        const title = "Nothing's playing";
        const source = "";
        store.collection('tracks').get().then(snapshot => {
            const tracks = snapshot.docs.map(doc => doc.data());
            res.render('pages/index', {
            title: title,
            source: source,
            tracks: tracks,
            username: req.username
            });
        });
        }
    });
    });