'use strict';

var DEFAULT_USER_ICON = '/images/icon_members.png';
var DEFAULT_GROUP_ICON = '/images/icon_group.png';

exports.getUserPhoto = function(id, has_photo) {
  return has_photo ? '/api/v1/users/' + id + '/photo' : DEFAULT_USER_ICON;
};

exports.validatePresenceOf = function(value) {
  return value && value.length;
};

exports.validateEmail = function(email) {
  return (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i).test(email);
};
