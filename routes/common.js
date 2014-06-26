'use strict';

var common = localrequire.controller('common');

module.exports = function(app, api) {
  app.route(api('/version'))
    .get(common.version);
};
