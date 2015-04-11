var Agenda = require('agenda');

var agenda = new Agenda({db: {address: 'localhost:27017/tubetopad'}});

var data = {url: 'https://www.youtube.com/watch?v=w8fOEEMqpOw', show: 'DevOps'};
agenda.now('enqueue video', data);

agenda._db.close(function (err) {
    process.exit();
});
