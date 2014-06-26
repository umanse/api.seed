'use strict';

var cors = require('cors'),
    errorHandler = localrequire.middleware('errorhandler');

var api = function(route) { return '/api' + route; };
var apiv = function(route) { return '/api/v1' + route; };

module.exports = function(app) {
  app.route(api('/*'))
    .all(cors({
      origin: true,
      methods: ['GET', 'PUT', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Auth-Token'],
      credentials: true,
      maxAge: 86400
    }));

  app.route(api('/*'))
    .all(function(req, res, next) {
    res.setToken = function(token) {
      res.token = token;
    };

    res.finish = function(data) {
      data = data || {};
      if (res.token) data.token = res.token;
      res.json(data);
    };

    next();
  });

  localrequire.routes(function(route) {
    route(app, api, apiv);
  });

  // All undefined api routes should return a 404
  app.route(api('/*'))
    .all(function(req, res, next) {
      next(Error.new({
        code: 'API_NOT_FOUND',
        message: 'API for url:' + req.url + ' is not found.'
      }));
    });

  app.use(errorHandler());
};
