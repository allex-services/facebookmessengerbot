function createFacebookMessengerResponder (execlib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  function FacebookMessengerResponder (res, verify_token, page_access_token, request) {
    this.verify_token = verify_token;
    this.page_access_token = page_access_token;
    this.res = res;
    this.incomingRequest = request;
    this.process();
  }
  FacebookMessengerResponder.prototype.destroy = function () {
    this.incomingRequest = null;
    this.res = null;
    this.page_access_token = null;
    this.verify_token = null;
  };
  function processJSONReq(res, jsonreq, verify_token, page_access_token, responderClass) {
    var requestArry = createRequestArry(jsonreq);
    requestArry.forEach(createRequest.bind(null, responderClass, res, verify_token, page_access_token));
  }
  function createRequest(responderClass,res,verify_token,page_access_token,req){
    new responderClass(res,verify_token,page_access_token,req);
  }
  function createRequestArry(jsonreq){
    //this method ALWAYS return array
    //TODO add types
    if (jsonreq['hub.mode'] === 'subscribe'){
      return [new FacebookMessengerResponder.MessageTypes.Subscribe(jsonreq)];
    }
    if (jsonreq['object'] === 'page'){
      return new FacebookMessengerResponder.MessageTypes.ReceivePayload(jsonreq).entries; //TODO must work for all messages
    }
    return jsonreq;
  }
  FacebookMessengerResponder.prototype.callMethod = function (methodName, params) {
    //var ret = JSON.stringify(lib.extend({method:methodName},params));
    this.res.setHeader('Content-Type', 'application/json');
    this.res.end(JSON.stringify(lib.extend({method:methodName},params)));
    this.destroy();
  };
  FacebookMessengerResponder.prototype.sendMessage = function (payload) {
    //payload -> https://developers.facebook.com/docs/messenger-platform/send-api-reference#payload
    lib.request('https://graph.facebook.com/v2.6/me/messages?access_token=' + this.page_access_token,{ 
      parameters: payload,
      method: 'POST', 
      onComplete: this.onMessageSent.bind(this),
      onError: this.onMessageFailed.bind(this) 
    });
  };
  FacebookMessengerResponder.prototype.onMessageSent = function(){
    this.res.end('{}');
    this.destroy();
  };
  FacebookMessengerResponder.prototype.onMessageFailed = function(){
    this.res.statusCode = 403;
    var errorMsg = 'Error on message deilvery from Facebook Messenger API'; 
    this.res.end(errorMsg);
    console.log('ERROR: ' + errorMsg);
    this.destroy();
  };
  //to override
  FacebookMessengerResponder.prototype.process = function () {
  };
  FacebookMessengerResponder.factory = function (res, responderClass, verify_token, page_access_token, req) {
    var jsonreq;
    try {
      if (lib.isString(req)){
        jsonreq = JSON.parse(req);
      }else{
        jsonreq = req;
      }
      processJSONReq(res, jsonreq, verify_token, page_access_token, responderClass);
    } catch(e) {
      console.error(e);
      res.end('{}');
    }
  };
  FacebookMessengerResponder.MessageTypes = require('./messageTypes/messagetypes.js')(execlib);
  return FacebookMessengerResponder;
}
module.exports = createFacebookMessengerResponder;
