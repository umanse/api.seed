'use strict';

var jwt = require('jsonwebtoken'),
    config = localrequire.config(),
    User = localrequire.service('user');

exports.me = function(req, res, next) {
  User.read(req.login.id)
  .then(function(user) {
    res.finish({
      data: user
    });
  }).catch(function(err) {
    next(err);
  });
};

exports.login = function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  User.authenticate(email, password)
  .then(function(user) {
    var token = jwt.sign({
      id: user.id,
      email: user.email
    }, config.token.secret, {
      expiresInMinutes: config.token.expiresInMinutes
    });

    res.setHeader('Auth-Token', token);
    res.setToken(token);

    res.finish({
      data: user
    });
  }).catch(function(err) {
    next(err);
  });
};

exports.logout = function(req, res) {
  res.finish();
};
