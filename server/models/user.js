const mongoose = require('mongoose');
const validator = require("validator");
const {SHA256} = require("crypto-js");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var secret = "abc123";

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true, 
    validate: {
      validator: validator.isEmail,
      message:"{VAL} is not a valid email",
      isAsync: false
    }
  },
  password: {
    required: true,
    type: String,
    minlength: 6
  }, 
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ["_id", "email"]);

}


UserSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = "auth";
  var token = jwt.sign({_id: user._id.toHexString(), access}, secret).toString();
  user.tokens.push({
    access,
    token
  });

  return user.save().then(() => {
    return token;
  });

}

UserSchema.statics.findByToken = function(token){
  var User = this;
  var decoded; 

  try {

    decoded = jwt.verify(token, secret);

  } catch(e) {
    return Promise.reject();
  }

  return User.findOne({

    "_id": decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"

  });

}

UserSchema.pre("save", function(next){
  var user = this;
  var pwd = user.password;

  if (user.isModified("password")){
    bcrypt.genSalt(10, (err, salt) => {

      bcrypt.hash(pwd, salt, (err, res) => {
        user.password = res;

        next();
      });
    })
  } else {
    next();
  }
  
});

var User = mongoose.model('User', UserSchema );

module.exports = {User}