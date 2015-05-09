var express = require('express');
var mongoose = require('mongoose');
var app = express();

mongoose.set('debug', true);
mongoose.connect('mongodb://localhost:27017/tubetopad');
var Video = mongoose.model('agendaJobs', {url: String, show: String}, 'agendaJobs');

app.use(express.static(__dirname + '/public'));

app.get('/api/video', function (req, res, next) {
    Video.find({type: 'video'})
        .sort({updated_at: 'desc'})
        .exec(function (err, videos) {
            res.json(videos);
        });
});
app.listen(3000);
console.log('Listening on http://localhost:3000/');
