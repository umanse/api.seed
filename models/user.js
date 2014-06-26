'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    crypto = require('crypto'),
    common = require('./common');

var UserSchema = new Schema({
  email: {
    type: String,
    index: { unique: true },
    lowercase: true
  },
  salt: String,
  hashed_password: String,
  name: String,
  description: String,
  has_photo: {
    type: Boolean,
    default: false
  },
  photo: String,
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  last_logged_in: Date,
  email_validated: Boolean
}, {
  toJSON: {
    virtuals: true,
    getters: true,
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret._id;
      delete ret.password;
      delete ret.salt;
      delete ret.hashed_password;
      delete ret.photo;
      ret.photo = common.getUserPhoto(ret.id, ret.has_photo);

      return ret;
    }
  }
});

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

UserSchema
  .pre('save', function(next) {
    if (!common.validatePresenceOf(this.email)) {
      next(Error.new({
        code: 'REQUIRED_FIELD',
        field: 'email',
        message: 'Email is required.'
      }));
    } else {
      if (!common.validateEmail(this.email)) {
        next(Error.new({
          code: 'INVALID_FIELD',
          field: 'email',
          message: 'Email format is not valid.'
        }));
      } else {
        next();
      }
    }
  })
  .pre('save', function(next) {
    if (!common.validatePresenceOf(this.hashed_password)) {
      next(Error.new({
        code: 'REQUIRED_FIELD',
        field: 'password',
        message: 'Password is required.'
      }));
    } else {
      next();
    }
  })
  .pre('save', function(next) {
    if (!common.validatePresenceOf(this.name)) {
      next(Error.new({
        code: 'REQUIRED_FIELD',
        field: 'name',
        message: 'Name is required.'
      }));
    } else {
      next();
    }
  });

UserSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
