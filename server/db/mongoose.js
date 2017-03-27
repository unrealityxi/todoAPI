var mongoose = require('mongoose');

// Tells mongoose to use default es6 promises
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};