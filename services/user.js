'use strict';

var Q = require('q'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.list = function(options) {
  if (!options) options = {};
  if (!options.sort) options.sort = {};
  if (!options.sort.by) options.sort.by = 'created_at';
  if (!options.limit) options.limit = 10;
  if (options.limit < 1) options.limit = 1;
  if (options.limit > 100) options.limit = 100;

  var query = User.find();

  if (options.name) query.where('name').equals(new RegExp(options.name, 'i'));
  if (options.email) query.where('email').equals(new RegExp(options.email, 'i'));

  var sort = options.sort;
  query.where(sort.by);
  if (sort.lt) query.lt(sort.lt);
  if (sort.lte) query.lte(sort.lte);
  if (sort.gt) query.gt(sort.gt);
  if (sort.gte) query.gte(sort.gte);
  query.sort((sort.desc ? '-' : '') + sort.by);
  query.limit(options.limit);

  var deferred = Q.defer();

  query.exec(function(err, users) {
    if (err) return deferred.reject(err);

    deferred.resolve(users);
  });

  return deferred.promise;
};

exports.preload = function(id) {
  var deferred = Q.defer();

  User.findOne({ _id: id }).exec(function(err, user) {
    if (err) {
      if (err.name === 'CastError' && err.type === 'ObjectId') return deferred.reject(
        Error.new({
          code: 'USER_NOT_FOUND',
          message: 'User:' + id + ' is not found.'
        })
      );
      else return deferred.reject(err);
    }

    if (!user) return deferred.reject(
      Error.new({
        code: 'USER_NOT_FOUND',
        message: 'User:' + id + ' is not found.'
      })
    );

    deferred.resolve(user);
  });

  return deferred.promise;
};

exports.read = function(id) {
  var deferred = Q.defer();

  User.findOne({ _id: id }).exec(function(err, user) {
    if (err) {
      if (err.name === 'CastError' && err.type === 'ObjectId') return deferred.reject(
        Error.new({
          code: 'USER_NOT_FOUND',
          message: 'User:' + id + ' is not found.'
        })
      );
      else return deferred.reject(err);
    }

    if (!user) return deferred.reject(
      Error.new({
        code: 'USER_NOT_FOUND',
        message: 'User:' + id + ' is not found.'
      })
    );

    deferred.resolve(user);

  });

  return deferred.promise;
};

exports.authenticate = function(email, password) {
  var deferred = Q.defer();

  User.findOne({ email: email.toLowerCase() }).exec(function(err, user) {
    if (err) return deferred.reject(err);

    if (!user) return deferred.reject(
      Error.new({
        code: 'USER_MISMATCH',
        message: 'User:' + email + ' is not found.'
      })
    );
    if (!user.authenticate(password)) return deferred.reject(
      Error.new({
        code: 'PASSWORD_MISMATCH',
        message: 'Password for user:' + email + ' is invalid.'
      })
    );

    deferred.resolve(user);
  });
  
  return deferred.promise;
};

exports.create = function(contents) {
  var invalid = _.findKey(contents, function(value, key) {
    return !_.some(['email', 'password', 'name', 'description'], function(field) {
      return field === key;
    });
  });

  if (invalid) {
    return Q.fcall(function() {
      throw Error.new({
        code: 'INVALID_FIELD',
        field: invalid,
        message: 'Field:' + invalid + ' is invalid.'
      });
    });
  }

  var deferred = Q.defer();

  new User(contents).save(function(err, user) {
    if (err) {
      if (err.code === 11000) return deferred.reject(
        Error.new({
          code: 'USER_DUPLICATED',
          message: 'User:' + contents.email + ' already exists.'
        })
      );
      else return deferred.reject(err);
    }

    deferred.resolve(user);
  });

  return deferred.promise;
};

exports.update = function(user, contents) {
  var invalid = _.findKey(contents, function(value, key) {
    return !_.some(['name', 'description'], function(field) {
      return field === key;
    });
  });

  if (invalid) {
    return Q.fcall(function() {
      throw Error.new({
        code: 'INVALID_FIELD',
        field: invalid,
        message: 'Field:' + invalid + ' is invalid.'
      });
    });
  }

  _.forOwn(contents, function(value, key) {
    user[key] = value;
  });

  var deferred = Q.defer();

  user.save(function(err, user) {
    if (err) return deferred.reject(err);

    deferred.resolve(user);
  });

  return deferred.promise;
};

exports.delete = function(user) {
  var deferred = Q.defer();

  user.remove(function(err, user) {
    if (err) return deferred.reject(err);

    deferred.resolve(user);
  });

  return deferred.promise;
};

exports.password = {
  update: function(user, contents) {
    var invalid = _.findKey(contents, function(value, key) {
      return !_.some(['old', 'new'], function(field) {
        return field === key;
      });
    });

    if (invalid) {
      return Q.fcall(function() {
        throw Error.new({
          code: 'INVALID_FIELD',
          field: invalid,
          message: 'Field:' + invalid + ' is invalid.'
        });
      });
    }

    var required = _.find(['old', 'new'], function(key) {
      return !contents[key];
    });

    if (required) {
      return Q.fcall(function() {
        throw Error.new({
          code: 'REQUIRED_FIELD',
          field: required,
          message: 'Field:' + required + ' is required.'
        });
      });
    }

    if (!user.authenticate(contents.old)) {
      return Q.fcall(function() {
        throw Error.new({
          code: 'PASSWORD_MISMATCH',
          message: 'Password for user:' + user.id + ' is invalid.'
        });
      });
    }

    var deferred = Q.defer();

    user.password = contents.new;

    user.save(function(err, user) {
      if (err) return deferred.reject(err);

      deferred.resolve(user);
    });

    return deferred.promise;
  }
};

exports.photo = {
  upload: function(user, image) {
    var deferred = Q.defer();

    user.has_photo = true;
    user.photo = image;

    user.save(function(err, user) {
      if (err) return deferred.reject(err);

      deferred.resolve(user);
    });

    return deferred.promise;
  },

  download: function(user) {
    var deferred = Q.defer();

    var id = user.id;

    User.findOne({ _id: id }).exec(function(err, user) {
      if (err) {
        if (err.name === 'CastError' && err.type === 'ObjectId') return deferred.reject(
          Error.new({
            code: 'USER_NOT_FOUND',
            message: 'User:' + id + ' is not found.'
          })
        );
        else return deferred.reject(err);
      }

      if (!user) return deferred.reject(
        Error.new({
          code: 'USER_NOT_FOUND',
          message: 'User:' + id + ' is not found.'
        })
      );

      if (!user.has_photo || !user.photo) return deferred.reject(
        Error.new({
          code: 'PHOTO_NOT_FOUND',
          message: 'Photo for user:' + user.id + ' is not found.'
        })
      );

      deferred.resolve(user);
    });

    return deferred.promise;
  }
};
