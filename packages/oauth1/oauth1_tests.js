Tinytest.add("oauth1 - loginResultForState is stored", function (test) {
  var http = Npm.require('http');
  var twitterfooId = Random.id();
  var twitterfooName = 'nickname' + Random.id();
  var twitterfooAccessToken = Random.id();
  var twitterfooAccessTokenSecret = Random.id();
  var twitterOption1 = Random.id();
  var state = Random.id();
  var serviceName = Random.id();

  var urls = {
    requestToken: "https://example.com/oauth/request_token",
    authorize: "https://example.com/oauth/authorize",
    accessToken: "https://example.com/oauth/access_token",
    authenticate: "https://example.com/oauth/authenticate"
  };

  OAuth1Binding.prototype.prepareRequestToken = function() {};
  OAuth1Binding.prototype.prepareAccessToken = function() {
    this.accessToken = twitterfooAccessToken;
    this.accessTokenSecret = twitterfooAccessTokenSecret;
  };

  ServiceConfiguration.configurations.insert({service: serviceName});

  try {
    // register a fake login service
    Oauth.registerService(serviceName, 1, urls, function (query) {
      return {
        serviceData: {
          id: twitterfooId,
          screenName: twitterfooName,
          accessToken: twitterfooAccessToken,
          accessTokenSecret: twitterfooAccessTokenSecret
        },
        options: {
          option1: twitterOption1
        }
      };
    });

    // simulate logging in using twitterfoo
    Oauth1._requestTokens[state] = twitterfooAccessToken;

    var req = {
      method: "POST",
      url: "/_oauth/" + serviceName + "?close",
      query: {
        state: state,
        oauth_token: twitterfooAccessToken
      }
    };
    Oauth._middleware(req, new http.ServerResponse(req));

    // Test that right data is placed on the loginResult map
    test.equal(
      Oauth._loginResultForState[state].serviceName, serviceName);
    test.equal(
      Oauth._loginResultForState[state].serviceData.id, twitterfooId);
    test.equal(
      Oauth._loginResultForState[state].serviceData.screenName, twitterfooName);
    test.equal(
      Oauth._loginResultForState[state].serviceData.accessToken, twitterfooAccessToken);
    test.equal(
      Oauth._loginResultForState[state].serviceData.accessTokenSecret, twitterfooAccessTokenSecret);
    test.equal(
      Oauth._loginResultForState[state].options.option1, twitterOption1);

  } finally {
    Oauth._unregisterService(serviceName);
  }
});
