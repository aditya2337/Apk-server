const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/schema/userSchema');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const App = require('../model/schema/appsSchema');
const ObjectId = require('mongodb').ObjectId;
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const crypto = require('crypto');
const dir = require('node-dir');
var exec = require('child_process').execSync;
require('../passport');

var storage = multer.diskStorage({
  destination: './public/upload/temp',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err);
      cb(null, file.originalname);
    });
  }
});

var diretoryTreeToObj = function (dir, done) {
  var results = {};
  var _contents = [];
  var files = [];
  fs.readdir(dir, function (err, list) {
    if (err) {
      return done(err);
    }
    var pending = list.length;
    if (!pending) {
      return done(null, {name: path.basename(dir), type: 'folder', children: results});
    }
    list.forEach(function (file, index) {
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        results['_contents'] = files;
        if (stat && stat.isDirectory()) {
          diretoryTreeToObj(file, function (err, res) {
            results[path.basename(file)] = res;
            if (!--pending) {
              done(null, results);
            }
          });
        } else {
          files.push({
            name: path.basename(file),
            path: file
          });
          results['_contents'] = files;
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
};

const upload = multer({ storage: storage });

/* GET users listing. */
router
.use(passport.initialize())
.use(passport.session())
.use(bodyParser.urlencoded({ extended: true }))
.use(bodyParser.json())
// API
.get('/user/:id', (req, res, next) => {
  var id = req.params.id;
  User.db.collection('users')
  .findOne({_id: ObjectId(id)}, (err, user) => {
    if (err) res.send(err);
    res.send(user);
  });
})
.post('/', (req, res, next) => {
  var email = req.body.email;
  var password = bcrypt.hashSync(req.body.password);
  User.db.collection('users')
  .insert({email, password}, (err, doc) => {
    if (err) res.send(err);
    res.send(doc);
  });
})
.put('/:id', (req, res, next) => {
  var {id} = req.params;
  User.db.collection('users')
  .update({_id: ObjectId(id)}, {username: req.body.username}, (err, user) => {
    if (err) res.send(err);
    res.send(user);
  });
})
.delete('/:id', (req, res, next) => {
  var {id} = req.params;
  User.db.collection('users')
  .remove({_id: ObjectId(id)}, (err, user) => {
    if (err) res.send(err);
    console.log(user);
    if (user === 0) res.sendStatus(400);
    res.sendStatus(200);
  });
})

// login and registration actions
.get('/home', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://apk-decompiler.herokuapp.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.json({
    session: req.session,
    user: req.user,
    authenticated: req.isAuthenticated()
  });
})
.get('/login', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://apk-decompiler.herokuapp.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.json({name: 'login again',
    authenticated: req.isAuthenticated()
  });
})
.post('/login', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://apk-decompiler.herokuapp.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, passport.authenticate('local', {
  successRedirect: '/users/home',
  failureRedirect: '/users/login'
}))
.get('/logout', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://apk-decompiler.herokuapp.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  req.session.destroy((err) => {
    if (err) res.sendStatus(400);
    res.redirect('/users/login');
  });
})

// signup
.get('/signup', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://apk-decompiler.herokuapp.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.json({name: 'signup again',
    authenticated: req.isAuthenticated()
  });
})
.post('/signup', (req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', 'http://apk-decompiler.herokuapp.com');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, passport.authenticate('local-register', {
  successRedirect: '/users/home',
  failureRedirect: '/users/signup'
}))

// OAUTH2
.get('/auth/twitter',
passport.authenticate('twitter'))
.get('/auth/twitter/callback',
passport.authenticate('twitter', { failureRedirect: '/login' }),
function (req, res) {
  // Successful authentication, redirect home.
  res.redirect('http://apk-decompiler.herokuapp.com/home');
})

// app links
.get('/app/get-code', function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', 'http://apk-decompiler.herokuapp.com');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  console.log(req.query);
  fs.readFile(req.query.filePath, 'utf8', function (err, data) {
    if (err) {
      return res.send(err);
    }
    res.send(data);
  });
})
.post('/app', upload.single('file'), (req, res) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', 'http://apk-decompiler.herokuapp.com');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  exec(`apktool d ./public/upload/temp/${req.file.originalname} -o ./public/upload/temp/decompiled/${req.body.userId}/${req.file.originalname.slice(0, -4)} -f`, (err, stdout, stderr) => {
    if (err) {
      console.log('child processes failed with error code: ' +
      err.code);
    }
    console.log(stdout);
  });
  diretoryTreeToObj(`./public/upload/temp/decompiled/${req.body.userId}/${req.file.originalname.slice(0, -4)}`, function (err, docs) {
    if (err) {
      console.error(err);
    }
    res.json(docs);
  });
})
.post('/app/save-apk', (req, res) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', 'http://apk-decompiler.herokuapp.com');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  // Push the app to mongo
  var newApp = new App();
  console.log(req.query);
  // set the mongo document properties
  newApp.apk = req.query.file.originalname;
  newApp.userId = req.query.userId;

  // save the app
  newApp.save((err) => {
    if (err) {
      throw err;
    }
    res.send(newApp);
  });
})
;

module.exports = router;
