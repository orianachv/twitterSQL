'use strict';
var express = require('express');
var app = express();
var volleyball = require('volleyball');
var nunjucks = require('nunjucks');
var routes = require('./routes');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var bodyParser = require('body-parser');

// templating boilerplate setup
app.engine('html', nunjucks.render); // como renderear templates html
app.set('view engine', 'html'); // que extensiones de archivo tienen los templates
nunjucks.configure('views', { noCache: true }); // donde encontrar las views

// logging middleware
app.use(volleyball);

// body parsing middleware
app.use(bodyParser.urlencoded({ extended: true })); // para HTML form submits
app.use(bodyParser.json()); // seria para AJAX requests


// comienza el servidor
app.listen(1337, function(){
  console.log('listening on port 1337');
});

app.use(express.static(path.join(__dirname, '/public')));

// rutas modulares
app.use('/', routes);

// // static file middleware escrito manualmente
// app.use(function(req, res, next){
//   var mimeType = mime.lookup(req.path);
//   fs.readFile('./public' + req.path, function(err, fileBuffer){
//     if (err) return next();
//     res.header('Content-Type', mimeType);
//     res.send(fileBuffer);
//   });
// });
