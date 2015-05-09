var Agenda = require('agenda');

var agenda = new Agenda({db: {address: 'localhost:27017/tubetopad'}});

agenda.now('enqueue video', {url: 'http://www.youtube.com/watch?v=mBy20FgB68Q', show: 'Youtube'});

//var path = require('path');
//var fs = require('fs');

//var download_path = path.join(__dirname, '../download');
//var files = fs.readdirSync(download_path), i, n = 1;
//for (i = 0; i < files.length; ++i) {
//    if (files[i] == '.DS_Store') {
//        continue;
//    }
//    var file = path.join(download_path, files[i]);
//    console.log(file);

//    agenda.now('convert file for iPad', {
//        data: {show: 'CodeClinic', episodeNumber: n++},
//        filename: file
//    });
//}

agenda._db.close(function (err) {
    process.exit();
});
