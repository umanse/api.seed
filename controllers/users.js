'use strict';

var jwt = require('jsonwebtoken'),
    fs = require('fs'),
    easyimage = require('easyimage'),
    config = localrequire.config(),
    User = localrequire.service('user');

exports.list = function(req, res, next) {
  var sort = getSort(req.query.sort);

  User.list({
    name: req.query.name,
    email: req.query.email,
    sort: {
      by: sort.by,
      desc: sort.desc,
      lt: req.query.lt,
      lte: req.query.lte,
      gt: req.query.gt,
      gte: req.query.gte
    },
    limit: req.query.limit
  }).then(function(users) {
    res.finish({
      data: users
    });
  }).catch(function(err) {
    next(err);
  });
};

exports.read = function(req, res, next) {
  User.read(req.params.user)
  .then(function(user) {
    res.finish({
      data: user
    });
  }).catch(function(err) {
    next(err);
  });
};

exports.create = function(req, res, next) {
  User.create(req.body)
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

exports.update = function(req, res, next) {
  delete req.body.id;

  User.update(req.user, req.body)
  .then(function(user) {
    res.finish({
      data: user
    });
  }).catch(function(err) {
    next(err);
  });
};

exports.delete = function(req, res, next) {
  User.delete(req.user)
  .then(function(user) {
    res.finish({
      data: user
    });
  }).catch(function(err) {
    next(err);
  });
};

exports.password = {
  update: function(req, res, next) {
    delete req.body.id;

    User.password.update(req.user, req.body)
    .then(function() {
      res.finish();
    }).catch(function(err) {
      next(err);
    });
  }
};

exports.photo = {
  upload: function(req, res, next) {
    var user = req.user;
    var photo = req.files.photo;

    if (photo && photo.path) {
      easyimage.resize({
        src: photo.path,
        dst: photo.path,
        width: 150
      }, function(err) {
        if (err) return next(err);

        fs.readFile(photo.path, 'base64', function(err, image) {
          fs.unlink(photo.path);

          if (err) return next(err);

          User.photo.upload(user, image)
          .then(function(user) {
            res.writeHead('200', { 'Content-Type': 'image/png' });
            res.end(user.photo, 'base64');
          }).catch(function(err) {
            next(err);
          });
        });
      });
    } else {
      next(Error.new({
        code: 'REQUIRED_PHOTO',
        message: 'No photo image attached.'
      }));
    }
  },

  download: function(req, res, next) {
    User.photo.download(req.user)
    .then(function(user) {
      res.writeHead('200', { 'Content-Type': 'image/png' });
      res.end(user.photo, 'base64');
    }).catch(function(err) {
      next(err);
    });
  }
};
