require("./config/config");

const express = require('express');
const bodyParser = require('body-parser');
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const {ObjectID} = require("mongodb");
const helmet = require("helmet");

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require("./middleware/authenticate");

const PORT = process.env.PORT || 3000;

var app = express();

app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.7.6' }));

app.use(bodyParser.json());

// handle creation of new todos

app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    // fetch todos text from request body
    text: req.body.text,
    _creator: req.user._id
  });

  // Save todo
  todo.save().then((doc) => {

    // send saved doc back if saved
    res.send(doc);
  }, (e) => {
    
    // In case of error send error back
    res.status(400).send(e);
  });
});


// Get all todos from database

app.get("/todos", authenticate, (req, res) => {

  // finds all todos
  Todo.find({
    _creator: req.user._id
  }).then((todos)=>{
    // sends all found todos back
    res.send({todos});
  }, (e)=>{
    // if error, send it back.
    res.status(400).send(e);
  });
});

// Gets an individual todo

app.get("/todos/:id", authenticate, (req, res) => {

  // gets id of todo 
  var id = req.params.id;

  // Checks if id is valid
  if (!ObjectID.isValid(id)){
    return res.send("Invalid id");
  }

  // Finds todo with that specific id
  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {

    // check if return value is actual doc
    if (!todo){
      return res.status(404).send();
    }

    return res.send({todo});

  }).catch((e) => {
    return console.log(e);
  });
});


// Delete specific todo

app.delete("/todos/:id", authenticate, (req, res) => {

  // get todos ID
  var id = req.params.id;

  // verify objects id
  if (!ObjectID.isValid(id)){
    return res.status(404).send("Invalid id");
  }

  // removes doc by id
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.params.id
  }).then((s) => {

    // if nothing is removed or doc doesnt exist
    if (!s){
      return res.status(404).send("No such id");
    }

    // send deleted doc back.
    return res.send(s);

    // handle errors
  }, (e) => {
    return res.status(400).send("Something broke.");
  }).catch((e) => {
    return res.status(400).send(e)
  });

});


// Update doc.

app.patch("/todos/:id", authenticate, (req, res) => {
  // fetch id
  var id = req.params.id;

  // Reduces request to an object containing only desired properties
  var body = _.pick(req.body, ["text", "completed"]);

  // verify id
  if (!ObjectID.isValid(id)){
    return res.status(404).send("Invalid id");
  }

  // checks for bogus data in todo update req.
  if (_.isBoolean(body.completed) && body.completed) {

    // if not bogus and true, sets completed date of a TODO
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed = false;
    body.completedAt = null;
  }

  // does actual updating
  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.body.id
  }, {$set: body}, {new: true}).then((todo) => {
    
    // if no such doc
    if (!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })

});

// Set up new user creation
app.post("/users", (req, res) => {

  // Pull off props from req using pick
  var body = _.pick(req.body, ["email", "password"]);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();

  }).then((token) => {
    res.header("x-auth", token).send(user);
  }).catch((e) => {
    return res.status(400).send(e);
  });

});

app.get("/users/me", authenticate, (req, res) => {  
  res.send(req.user);
});

// POST /users/login {email, pwd}

app.post("/users/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);

  User.findOne({"email": body.email}).then((user)=> {
    if (!user){
      return res.status(400).send("User not found");
    }
  });

  User.findByCredentials(body.email, body.password).then((user) => {
    user.generateAuthToken().then((token) => {
      res.header("x-auth", token).send(user);
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// Logout

app.delete("/users/me/token", authenticate, (req, res) =>{

  req.user.removeToken(req.token).then(()=>{
    res.status(200).send();
  }), () => {
    res.status(400).send();
  }
});

app.listen(PORT, () => {
  console.log(`Started app on port ${PORT}`);
});

module.exports = {app};









































