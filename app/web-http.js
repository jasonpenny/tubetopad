var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Agenda = require('agenda');
var youtubedl = require('youtube-dl');
var socketio = require('socket.io');

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
    //console.log(req.body);

    var video = youtubedl(req.body.url);
    video.on('info', function (info) {
        //agenda.now('enqueue video', req.body);
        var data = {
            url: req.body.url,
            show: req.body.show,
            filename: info._filename,
            description: info.description,
            duration: info.duration,
            thumbnail: info.thumbnail,
            size: info.size,
            updated_at: (new Date())
        };
        agenda._db.insert(data, function () {
            data.video_id = data._id;
            delete data._id;

            agenda.now('enqueue video', data);

            res.json(data);
        });
    });
});

var server = app.listen(3000);
var io = socketio.listen(server);

var workerupdatesSchema = new mongoose.Schema(
    {
        worker: String,
        step: Number,
        progress: Number
    },
    {
        capped: {
            size: 16777216,
            autoIndexId: true
        }
    });

var workerupdates = mongoose.model('workerupdates', workerupdatesSchema);

io.sockets.on('connection', function (socket) {
    //console.log('new connection');
    socket.emit('info', {msg: 'socket.io connection'});

    workerupdates.find({})
        .sort({"$natural": -1})
        .limit(1)
        .exec(function(err, docs) {
            if (err) throw err;

            var search = {"_id": {"$gt": docs[0].id}};
            var fields = null;
            var tailOpts = {
                tailable: true,
                awaitdata: true,
                numberOfRetries: Number.MAX_VALUE
            };
            var stream = workerupdates
                .find(search, fields, tailOpts)
                .stream();

            stream.on('data', function (doc) {
                socket.emit('info', doc);
            });
            stream.on('error', function (err) {
                //console.log('stream error');
                //console.log(err);
                socket.emit('info', doc);
            });
        });
});

console.log('Listening on http://localhost:3000/');
