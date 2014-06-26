'use strict';

exports.version = function(req, res) {
  res.finish({
    data: '1.0.0'
  });
};
