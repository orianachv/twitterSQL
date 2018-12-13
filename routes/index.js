'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');

module.exports = router;

// una función reusable
function respondWithAllTweets (req, res, next){
  var allTheTweets = tweetBank.list();
  res.render('index', {
    title: 'Twitter.js',
    tweets: allTheTweets,
    showForm: true
  });
}

// aca basícamente tratamos a la root view y la tweets view como identica
router.get('/', respondWithAllTweets);
router.get('/tweets', respondWithAllTweets);

// página del usuario individual
router.get('/users/:username', function(req, res, next){
  var tweetsForName = tweetBank.find({ name: req.params.username });
  res.render('index', {
    title: 'Twitter.js',
    tweets: tweetsForName,
    showForm: true,
    username: req.params.username
  });
});

// página del tweet individual
router.get('/tweets/:id', function(req, res, next){
  var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
  res.render('index', {
    title: 'Twitter.js',
    tweets: tweetsWithThatId // un arreglo de solo un elemento ;-)
  });
});

// crear un nuevo tweet
router.post('/tweets', function(req, res, next){
  var newTweet = tweetBank.add(req.body.name, req.body.content);
  res.redirect('/');
});


// // reemplazá esta ruta hard-codeada con static routing general en app.js
// router.get('/stylesheets/style.css', function(req, res, next){
//   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
// });
