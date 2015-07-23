var path = require('path');
var fs = require('fs');
var youtubedl = require('youtube-dl');
var handbrake = require('handbrake-js');
var exec = require('child_process').exec;

var Agenda = require('agenda');
var agenda = new Agenda({
    db: {address: 'localhost:27017/tubetopad'},
    defaultLockLifetime: 2 * 60 * 60 * 1000 // 2 hours
});

function mkdir(dir_path) {
    try {
        fs.mkdirSync(dir_path);
    } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
    }
}

agenda.define('enqueue video', function (job, done) {
    console.log('enqueue video', job.attrs.data.url);
    var data = job.attrs.data;
    data.type = 'video';
    agenda._db.insert(data, function (err, result) {
        if (err) throw err;

        agenda.now('download URL', result[0]);
        done();
    });
});
agenda.define('download URL', {concurrency: 1}, function (job, done) {
    var data = job.attrs.data;

    console.log('downloadVideo: ' + path.basename(data.url));

    var failed = false, errorEvent = null;
    var video = youtubedl(data.url);
    // var size = 0;

    var output_path = path.join(__dirname, '../download');
    mkdir(output_path);

    var output_filename = path.join(output_path, data.filename);
    video.pipe(fs.createWriteStream(output_filename));

    //var pos = 0;
    //video.on('data', function(data) {
    //    pos += data.length;
    //    if (size) {
    //        var percent = (pos / size * 100).toFixed(2);
    //        process.stdout.cursorTo(0);
    //        process.stdout.clearLine(1);
    //        process.stdout.write(pos + ' ' + percent + '%');
    //    }
    //});

    video.on('error', function (err) {
        failed = true;
        errorEvent = err;
        console.log(' video.on(error)', err);
    });

    video.on('end', function (err) {
        if (failed || err) {
            var fail = {file: 'FAILED ' + output_filename, errorEvent: errorEvent, err: err};
            job.fail(fail);
            job.save();
            done();
        } else {
            console.log('finished downloading', output_filename);
            agenda.now('convert file for iPad', {data: data, filename: output_filename});
            done();
        }
    });
});
agenda.define('convert file for iPad', {concurrency: 1}, function (job, done) {
    var inputfile = job.attrs.data.filename;

    console.log('convertFileForIPad: ' + path.basename(inputfile));

    var output_path = path.join(__dirname, '../converted');
    mkdir(output_path);

    var failed = false, errorEvent = null;
    var options = {
        input: inputfile,
        output: path.join(output_path, path.basename(inputfile, path.extname(inputfile)) + '.mp4'),
        preset: 'iPad',
        optimize: true
    };
    var hb = handbrake.spawn(options);
    hb.on('error', function (err) {
        console.log('handbrake error', err);
        failed = true;
        errorEvent = err;
        job.fail(err);
        job.save();
        done();
    });
    //hb.on('progress', function (progress) {
    //    console.log(
    //        "Percent complete: %s, ETA: %s",
    //        progress.percentComplete,
    //        progress.eta
    //    );
    //});
    hb.on('end', function (err) {
        console.log('handbrake finished', options.output);
        if (failed || err) {
            console.log('  handbrake failed', errorEvent);
            var fail = {file: 'FAILED ' + output_filename, errorEvent: errorEvent, err: err};
            job.fail(fail);
            job.save();
            done();
            return;
        }

        fs.unlinkSync(inputfile);

        var data = {data: job.attrs.data.data, filename: options.output};
        agenda.now('set tv show metadata', data);
        done();
    });
});
agenda.define('set tv show metadata', {concurrency: 1}, function (job, done) {
    var data = job.attrs.data.data;
    var inputfile = job.attrs.data.filename;

    console.log('setTvShowMetadata: ' + path.basename(inputfile));

    var args = ['"' + inputfile.replace(/\$/g, '\\$') + '"'];
    args.push('--TVShowName "' + data.show + '"');
    args.push('--TVSeasonNum 1');
    args.push('--stik "TV Show"');

    // if sort director (artist) is not set, my iPad will group all tv shows
    args.push('--artist T');

    var artwork_path = path.join(__dirname, '../covers', data.show + '.jpg');
    args.push('--artwork "' + artwork_path + '"');
    if (data.episodeNumber) {
        args.push('--TVEpisodeNum ' + data.episodeNumber);
    }
    args.push('--overWrite');

    var cmdline = 'atomicparsley ' + args.join(' ');
    var child = exec(cmdline);
    child.on('close', function(code) {
        if (code) {
            var err = {
                code: code,
                cmdline: cmdline
            };
            console.log('atomicparsley error', err);
            job.fail(err);
            job.save();
            done();
        } else {
            console.log('finished ' + data.filename);
            done();
        }
    });
});

agenda.start();
