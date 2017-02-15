function createFacebookMessengerBotService(execlib, ParentService) {
  'use strict';
  
  var lib = execlib.lib,
    q = lib.q,
    FacebookMessengerResponder = require('./facebookmessengerrespondercreator')(execlib);

  function factoryCreator(parentFactory) {
    return {
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')),
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')) 
    };
  }

  function FacebookMessengerBotService(prophash) {
    ParentService.call(this, prophash);
    this.verifytoken = prophash.verifytoken;
    this.page_access_token = prophash.page_access_token;
    this.loadModules(prophash.verifytoken, prophash.page_access_token, prophash.modulehandler).then(
      this.readyToAcceptUsersDefer.resolve.bind(this.readyToAcceptUsersDefer, true)
    );
  }
  
  ParentService.inherit(FacebookMessengerBotService, factoryCreator);
  
  FacebookMessengerBotService.prototype.__cleanUp = function() {
    ParentService.prototype.__cleanUp.call(this);
  };

  FacebookMessengerBotService.prototype.isInitiallyReady = function(){
    return false;
  };

  function catchHelper(res,err){
    res.end('{}');
    console.error(err);
    res = null;
    err = null;
  }

  function onModulesLoaded(verifytoken,page_access_token,respondermodule){
    var responderClass = respondermodule(FacebookMessengerResponder);
    var ret = function(url, req, res){
      if (!responderClass){
        //TODO throw
        res.end('{}');
        return;
      }
      this.extractRequestParams(url, req).then(
        FacebookMessengerResponder.factory.bind(null,res,responderClass,verifytoken,page_access_token)
      ).catch(
        catchHelper.bind(null,res)
      );
    }
    ret.destroy = function(){
      responderClass = null;
    };
    FacebookMessengerBotService.prototype[verifytoken] = ret;
    return q(true);
  }

  FacebookMessengerBotService.prototype.loadModules = function(verifytoken, page_access_token, modulehandlername){
    return execlib.loadDependencies('client', [modulehandlername], onModulesLoaded.bind(this,verifytoken,page_access_token));
  };

  FacebookMessengerBotService.prototype.propertyHashDescriptor = {
    verifytoken: {
      type: 'string'
    },
    modulehandler: {
      type: 'string'
    }
  };
  
  return FacebookMessengerBotService;
}

module.exports = createFacebookMessengerBotService;
