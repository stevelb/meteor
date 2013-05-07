Github.requestCredential = function (options, callback, loginPopupClosedCallback) {
  // support both (options, callback) and (callback).
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'github'});
  if (!config) {
    callback && callback(new ServiceConfiguration.ConfigError("Service not configured"));
    return;
  }
  var state = Random.id();

  var scope = (options && options.requestPermissions) || [];
  var flatScope = _.map(scope, encodeURIComponent).join('+');

  var loginUrl =
        'https://github.com/login/oauth/authorize' +
        '?client_id=' + config.clientId +
        '&scope=' + flatScope +
        '&redirect_uri=' + Meteor.absoluteUrl('_oauth/github?close') +
        '&state=' + state;

  Oauth.initiateLogin(state, loginUrl, callback, loginPopupClosedCallback,
                                {width: 900, height: 450});
};