'use strict';

var express = require('express'),
    morgan = require('morgan'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    config = localrequire.config();

var app = express();

var env = app.get('env');

if ('development' === env) {
  app.use(require('connect-livereload')());
}

if ('production' === env) {
  app.use(compression());
}

app.use(morgan('dev'));
app.use(bodyParser());
app.use(methodOverride());

require('./routes')(app);

app.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

module.exports = app;
