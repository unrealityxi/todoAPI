var mongoose = require('mongoose');

// Tells mongoose to use default es6 promises
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://public:api@ds137760.mlab.com:37760/todos');

module.exports = {mongoose};