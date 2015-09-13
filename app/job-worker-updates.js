var mongoose = require('mongoose');

// mongoose.set('debug', true);
mongoose.connect('mongodb://localhost:27017/tubetopad');
function handleError(err) {
    console.error('handleError', err);
}
mongoose.connection.on('error', handleError);

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

exports.send = function (data) {
    var rec = new workerupdates(data);
    rec.save();
};
