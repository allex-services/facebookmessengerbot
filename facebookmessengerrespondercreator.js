function createFacebookMessengerResponder (execlib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib;

  var facebookAPIEndpoint = 'https://graph.facebook.com/v2.6';
  var messageAPIEndpoint = facebookAPIEndpoint + '/me/messages';
  var threadSettingsAPIEndpoint = facebookAPIEndpoint + '/me/thread_settings';

  function FacebookMessengerResponder (res, request, botService) {
    this.res = res;
    this.botService = botService;
    this.verify_token = botService.verifytoken;
    this.page_access_token = botService.page_access_token;
    this.cache = botService.cache;
    this.favorites = botService.favoritesMechanics;
    this.subscribe = botService.subscribeMechanics;
    this.userData = botService.userDataMechanics;
    this.incomingRequest = request;
    this.process();
  }
  FacebookMessengerResponder.prototype.destroy = function () {
    this.userData = null;
    this.subscribe = null;
    this.favorites = null;
    this.cache = null;
    this.incomingRequest = null;
    this.botService = null;
    this.res = null;
    this.page_access_token = null;
    this.verify_token = null;
  };
  function processJSONReq(res, jsonReq, botService, responderClass) {
    var requestArry = createRequestArry(jsonReq);
    if (!lib.isArray(requestArry)){
      return;
    }
    requestArry.forEach(createRequest.bind(null, responderClass, res, botService));
  }
  function createRequest(responderClass,res,botService,req){
    new responderClass(res,req,botService);
  }
  function createRequestArry(jsonReq){
    //this method ALWAYS return array
    //TODO add types
    if (jsonReq['hub.mode'] === 'subscribe'){
      return [new FacebookMessengerResponder.MessageTypes.Subscribe(jsonReq)];
    }
    if (jsonReq['object'] === 'page'){
      return new FacebookMessengerResponder.MessageTypes.ReceivePayload(jsonReq).entries; //TODO must work for all messages
    }
    return jsonReq;
  }
  FacebookMessengerResponder.prototype.callMethod = function (methodName, params) {
    //var ret = JSON.stringify(lib.extend({method:methodName},params));
    this.res.setHeader('Content-Type', 'application/json');
    this.res.end(JSON.stringify(lib.extend({method:methodName},params)));
    this.destroy();
  };
  FacebookMessengerResponder.prototype.getUserInfo = function(userId){
    //curl -X GET "https://graph.facebook.com/v2.6/<USER_ID>?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=PAGE_ACCESS_TOKEN"
    var userInfoDefer = q.defer();
    var userInfoAPIEndpoint = facebookAPIEndpoint + '/' + userId;
    var fields = 'first_name,last_name,profile_pic,locale,timezone,gender';
    var params = {
      fields : fields,
      access_token : this.page_access_token
    };
    lib.request(userInfoAPIEndpoint,{
      parameters : params,
      method: 'GET',
      onComplete: userInfoDefer.resolve.bind(userInfoDefer),
      onError: userInfoDefer.reject.bind(userInfoDefer, new Error('Error on Facebook User Info API request'))
    });
    return userInfoDefer.promise;
  };
  FacebookMessengerResponder.prototype.makeFBMessageRequest = function(payload){
    var defer = q.defer();
    var params = lib.extend(payload,{
      access_token : this.page_access_token
    });
    lib.request(messageAPIEndpoint,{
      parameters: params,
      method: 'POST', 
      onComplete: defer.resolve.bind(defer),
      onError: defer.reject.bind(defer, new Error('Error on Facebook Message API request'))
    });
    return defer.promise;
  };
  FacebookMessengerResponder.prototype.sendThreadSettings = function(payload){
    var params = lib.extend(payload,{
      access_token : this.page_access_token
    });
    lib.request(threadSettingsAPIEndpoint,{
      parameters: params,
      method: 'POST', 
      onComplete: console.log.bind(console, 'SUCCESS ON THREAD SETTINGS'),
      onError: console.log.bind(console,'ERROR ON THREAD SETTINGS') 
    });
  };
  FacebookMessengerResponder.prototype.sendMessage = function (payload) {
    //payload -> https://developers.facebook.com/docs/messenger-platform/send-api-reference#payload
    return this.makeFBMessageRequest(payload).then(
      this.onOperationSuccess.bind(this),
      this.onOperationFailed.bind(this)
    );
  };
  FacebookMessengerResponder.prototype.sendMessageArray = function(payloadArr){
    if (!lib.isArray(payloadArr)){
      throw new Error('payloadArr must be an array!');
    }
    var jobArr = [];
    for (var i=0; i<payloadArr.length; i++){
      jobArr.push(this.makeFBMessageRequest.bind(this,payloadArr[i]));
    };
    var job = new qlib.PromiseExecutorJob(jobArr);
    return job.go().then(
      this.onOperationSuccess.bind(this),
      this.onOperationFailed.bind(this)
    );
  };
  FacebookMessengerResponder.prototype.onOperationSuccess = function(res){
    if (res.statusCode !== 200){
      console.log('ERROR on Sending message ->>> ',arguments);
    }
    console.log('AJDE RES',res);
    if (!!this.res){
      this.res.end('{}');
    }
    this.destroy();
  };
  FacebookMessengerResponder.prototype.onOperationFailed = function(){
    var errorMsg = 'Error on message deilvery from Facebook Messenger API'; 
    if (!!this.res){
      this.res.statusCode = 403;
      this.res.end(errorMsg);
    }
    console.log('ERROR: ' + errorMsg);
    this.destroy();
  };
  //to override
  FacebookMessengerResponder.prototype.process = function () {
  };
  FacebookMessengerResponder.factory = function (res, responderClass, botService, req) {
    var jsonReq;
    try {
      if (lib.isString(req)){
        jsonReq = JSON.parse(req);
      }else{
        jsonReq = req;
      }
      processJSONReq(res, jsonReq, botService, responderClass);
    } catch(e) {
      console.error(e);
      res.end('{}');
    }
  };
  FacebookMessengerResponder.inProcessFactory = function (jsonReq, responderClass, botService) {
    try {
      new responderClass(null,new FacebookMessengerResponder.MessageTypes.InProcessRequest(jsonReq),botService);
    } catch(e) {
      console.error(e);
    }
  };
  FacebookMessengerResponder.MessageTypes = require('./messageTypes/messagetypes.js')(execlib);
  return FacebookMessengerResponder;
}
module.exports = createFacebookMessengerResponder;
