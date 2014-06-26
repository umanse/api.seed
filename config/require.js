'use strict';

var fs = require('fs'),
    path = require('path');

var root = path.normalize(__dirname + '/..');

GLOBAL.localrequire = {
  config: function() {
    return require('./config');
  },
  express: function() {
    return require('./express');
  },
  model: function(name) {
    return require('../models/' + name);
  },
  service: function(name) {
    return require('../services/' + name);
  },
  controller: function(name) {
    return require('../controllers/' + name);
  },
  middleware: function(name) {
    return require('../middlewares/' + name);
  },
  route: function(name) {
    return require('../routes/' + name);
  }
};

var traverse = function(directory, require, callback) {
  fs.readdirSync(path.normalize(root + '/' + directory))
    .forEach(function (file) {
      if (/(.*)\.(js$|coffee$)/.test(file)) {
        var module = require(file);
        if (callback) {
          callback(module);
        }
      }
    });
};

localrequire.models = function(callback) {
  traverse('models', localrequire.model, callback);
};

localrequire.routes = function(callback) {
  traverse('routes', localrequire.route, callback);
};
