'use strict';

var hasAuthorization = exports.hasAuthorization = function(checker, message) {
  return function(req, res, next) {
    if (!checker(req)) {
      return next(Error.new({
        code: 'FORBIDDEN',
        message: message || 'User is not authorized.'
      }));
    }
    next();
  };
};

exports.isSelf = hasAuthorization(function(req) {
  return req.params.user === req.login.id;
}, 'You are trying to update/delete other user, not you.');
