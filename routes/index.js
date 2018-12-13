'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var db = require('../db/index');

module.exports = router;

// una función reusable
function respondWithAllTweets(req, res, next) {
  db.query(
    'SELECT * FROM tweets INNER JOIN users ON users.id=user_id',
    (err, data) => {
      if (err) console.log(err);
      var tweets = data.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweets,
        showForm: true,
      });
    },
  );
}

// aca basícamente tratamos a la root view y la tweets view como identica
router.get('/', respondWithAllTweets);
router.get('/tweets', respondWithAllTweets);

// // página del usuario individual
router.get('/users/:username', function(req, res, next) {
  db.query(
    'SELECT * FROM tweets INNER JOIN users ON users.id = user_id WHERE users.name =  $1;',
    [req.params.username],
    (err, data) => {
      if (err) console.log(err);
      res.render('index', {
        title: 'Twitter.js',
        tweets: data.rows,
        showForm: true,
        username: req.params.username,
      });
    },
  );
});

// página del tweet individual
router.get('/tweets/:id', function(req, res, next) {
  db.query(
    'SELECT * FROM tweets INNER JOIN users ON users.id = user_id WHERE tweets.id = $1',
    [req.params.id],
    (err, data) => {
      if (err) console.log(err);
      res.render('index', {
        title: 'Twitter.js',
        tweets: data.rows, // un arreglo de solo un elemento ;-)
      });
    },
  );
});

// // crear un nuevo tweet
router.post('/tweets', function(req, res, next) {
  db.query(
    'SELECT id FROM users WHERE users.name = $1',
    [req.body.name],
    (err, data) => {
      if (data.rowCount == 0) {
        db.query(
          'INSERT INTO users (name) VALUES ($1)',
          [req.body.name],
          (err, data) => {
            db.query(
              'INSERT INTO tweets (content, user_id) VALUES ($1, (SELECT id FROM users WHERE name = $2))',
              [req.body.content, req.body.name],
              (err, data) => {
                res.redirect('/');
              },
            );
          },
        );
      } else {
        db.query(
          'INSERT INTO tweets (content, user_id) VALUES ($1, (SELECT id FROM users WHERE name = $2))',
          [req.body.content, req.body.name],
          (err, data) => {
            res.redirect('/');
          },
        );
      }
    },
  );
});
// // reemplazá esta ruta hard-codeada con static routing general en app.js
// router.get('/stylesheets/style.css', function(req, res, next){
//   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
// });
