const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./model/schema/userSchema');
const ObjectId = require('mongodb').ObjectId;
const TwitterStrategy = require('passport-twitter').Strategy;
require('./model/db');

passport.use(new LocalStrategy(authenticate));
passport.use('local-register', new LocalStrategy({ passReqToCallback: true }, register));
passport.use(new TwitterStrategy(
  {
    consumerKey: 'ypqpIPNoN73iiqq4ptC9pzgjm',
    consumerSecret: '0AwXcnBCKRnqaAdHmA5hIc0T7JemGi5HvLZ7L6hLehzLD9O9ba',
    callbackURL: 'http://localhost:3001/users/auth/twitter/callback'
  },
  function (token, tokenSecret, profile, done) {
    User.db.collection('users').findOne({
      oauth_provider: 'twitter',
      oauth_id: profile.username
    },
    (err, user) => {
      if (err) return done(null, false, {message: err});
      if (user) {
        return done(null, user);
      }

      // if there is no user with that email
      // create the user
      var newUser = new User();

      // set the user's local credentials
      newUser.oauth_provider = 'twitter';
      newUser.oauth_id = profile.username;

      // save the user
      newUser.save(function (err) {
        if (err) {
          throw err;
        }
        return done(null, newUser);
      });
    });
    // User.findOrCreate({ twitterId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
  }
));

function authenticate (email, password, done) {
  User.db.collection('users').find({email}).toArray((err, user) => {
    if (err) return done(null, false, {message: err});
    if (user.length === 0 || !bcrypt.compareSync(password, user[0].password)) {
      return done(null, false, {message: 'Invalid user and password combination'});
    }
    done(null, user[0]);
  });
}

function register (req, email, password, done) {
  console.log(req.query);
  User.db.collection('users').findOne({email}, (err, user) => {
    if (err) return done(null, false, {message: err});
    if (user) {
      return done(null, false, {message: 'an account with that email has already been created'});
    }

    // if there is no user with that email
    // create the user
    var newUser = new User();

    // set the user's local credentials
    newUser.fname = req.query.first_name;
    newUser.lname = req.query.last_name;
    newUser.email = email;
    newUser.password = bcrypt.hashSync(password);

    // save the user
    newUser.save(function (err) {
      if (err) {
        throw err;
      }
      return done(null, newUser);
    });
  });
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.db.collection('users').find({_id: ObjectId(id)}).toArray((err, user) => {
    if (err) return done(null, false, {message: err});
    done(null, user);
  });
});
