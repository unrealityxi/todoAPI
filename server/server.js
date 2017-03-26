const express = require('express');
const bodyParser = require('body-parser');
const _ = require("lodash");
const {ObjectID} = require("mongodb");


var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

const PORT = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get("/todos", (req, res) => {
  Todo.find().then((todos)=>{
    res.send({todos});
  }, (e)=>{
    res.status(400).send(e);
  });
});

// GET /todos/todo

app.get("/todos/:id", (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)){
    return res.send("Invalid id");
  }

  Todo.findById(id).then((todo) => {
    if (!todo){
      return res.status(404).send();
    }

    res.send({todo});

  }).catch((e) => {
    console.log(e);
  });
});

app.delete("/todos/:id", (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)){
    return res.status(404).send("Invalid id");
  }

  Todo.findByIdAndRemove(id).then((s) => {

    if (!s){
      return res.status(404).send("No such id");
    }
    return res.send(s);

  }, (e) => {
    return res.status(400).send("Something broke.");
  }).catch((e) => {
    return res.status(400).send(e)
  });

});

app.patch("/todos/:id", (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ["text", "completed"]);

  if (!ObjectID.isValid(id)){
    return res.status(404).send("Invalid id");
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {

    if (!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })

})

app.listen(PORT, () => {
  console.log(`Started app on port ${PORT}`);
});

module.exports = {app};









































