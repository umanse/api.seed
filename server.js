'use strict';

require('./config/errors');
require('./config/require');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose'),
    config = localrequire.config();

mongoose.connect(config.mongo.uri, config.mongo.options);
localrequire.models();

localrequire.express();
