var mongoose = require('mongoose');

// Sets up a model for Todo object
var Todo = mongoose.model('Todo', {
  // describes text property
  text: {
    type: String,
    required: true,
    // sets minimum length
    minlength: 1,
    // trims whitespace
    trim: true
  },
  completed: {
    type: Boolean,
    // sets the default value for the field
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = {Todo};
