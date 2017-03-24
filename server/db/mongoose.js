var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://public:api@ds137760.mlab.com:37760/todos');

module.exports = {mongoose};