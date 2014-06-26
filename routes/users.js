'use strict';

var users = localrequire.controller('users'),
    authentication = localrequire.middleware('authentication'),
    authorization = localrequire.middleware('authorization'),
    preloading = localrequire.middleware('preloading');

module.exports = function(app, api, apiv) {
  app.route(apiv('/users'))
    .get(
      authentication.requiresLogin,
      users.list
    )
    .post(
      users.create
    );

  app.route(apiv('/users/:user'))
    .get(
      authentication.requiresLogin,
      users.read
    )
    .put(
      authentication.requiresLogin,
      preloading.requiresUser,
      authorization.isSelf,
      users.update
    )
    .delete(
      authentication.requiresLogin,
      preloading.requiresUser,
      authorization.isSelf,
      users.delete
    );

  app.route(apiv('/users/:user/password'))
    .put(
      authentication.requiresLogin,
      preloading.requiresUser,
      authorization.isSelf,
      users.password.update
    );

  app.route(apiv('/users/:user/photo'))
    .get(
      preloading.requiresUser,
      users.photo.download
    )
    .put(
      authentication.requiresLogin,
      preloading.requiresUser,
      authorization.isSelf,
      users.photo.upload
    );
};
