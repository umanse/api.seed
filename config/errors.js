'use strict';

var _ = require('lodash');

Error.new = function(e) {
  var err = new Error();
  _.extend(err, e);
  return err;
};
