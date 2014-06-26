'use strict';

var session = localrequire.controller('session'),
    authentication = localrequire.middleware('authentication');

module.exports = function(app, api, apiv) {
  app.route(apiv('/session'))
    .get(
      authentication.requiresLogin,
      session.me
    )
    .post(
      session.login
    )
    .delete(
      authentication.requiresLogin,
      session.logout
    );
};
