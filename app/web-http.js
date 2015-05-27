var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Agenda = require('agenda');

var app = express();

var agenda = new Agenda({db: {address: 'localhost:27017/tubetopad'}});

mongoose.set('debug', true);
mongoose.connect('mongodb://localhost:27017/tubetopad');
var Video = mongoose.model('agendaJobs', {url: String, show: String}, 'agendaJobs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/api/video', function (req, res, next) {
    Video.find({type: 'video'})
        .sort({updated_at: 'desc'})
        .exec(function (err, videos) {
            res.json(videos);
        });
});

app.get('/api/shows', function (req, res, next) {
    fs.readdir(__dirname + '/../covers', function (err, files) {
        var shows = files.map(function (s) {
            return s.substring(0, s.indexOf('.'));
        });
        res.json(shows);
    });
});

app.post('/api/show', function (req, res, next) {
    console.log(req.body);
    agenda.now('enqueue video', req.body);
    res.json({success:true});
});

app.listen(3000);
console.log('Listening on http://localhost:3000/');
