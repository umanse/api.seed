'use strict';

var jwt = require('jsonwebtoken'),
    config = localrequire.config();

exports.requiresLogin = function(req, res, next) {

  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      jwt.verify(parts[1], config.token.secret, {}, function(err, login) {
        if (err) {
          if (err.message === 'jwt expired') {
            return next(Error.new({
              code: 'TOKEN_EXPIRED',
              message: 'The given token is expired.'
            }));
          } else {
            return next(Error.new({
              code: 'TOKEN_INVALID',
              message: 'The given token is not valid.'
            }));
          }
        }
        
        req.login = login;
        
        next();
      });
    } else {
      return next(Error.new({
        code: 'AUTHENTICATION_INVALID',
        message: 'The given Authorization header format is bad.'
      }));
    }
  } else {
    return next(Error.new({
      code: 'AUTHENTICATION_REQUIRED',
      message: 'No Authorization header was found.'
    }));
  }
};
