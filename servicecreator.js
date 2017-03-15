function createFacebookMessengerBotService(execlib, ParentService) {
  'use strict';
  
  var lib = execlib.lib,
    q = lib.q,
    FacebookMessengerResponder = require('./facebookmessengerrespondercreator')(execlib),
    CacheInvalidator = require('allex_cacheinvalidatorlowlevellib')(lib.runNext,lib.isFunction,lib.isDefinedAndNotNull);

  var execSuite = execlib.execSuite,
    RemoteServiceListenerServiceMixin = execSuite.RemoteServiceListenerServiceMixin;

  function factoryCreator(parentFactory) {
    return {
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')),
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')) 
    };
  }

  function FacebookMessengerBotService(prophash) {
    ParentService.call(this, prophash);
    RemoteServiceListenerServiceMixin.call(this);
    this.verifytoken = prophash.verifytoken;
    this.page_access_token = prophash.page_access_token;
    this.cache = new lib.Map();
    this.job_interval = prophash.job_interval || 15 * 1000;
    this.cacheInvalidator = new CacheInvalidator(this.cache, this.job_interval, prophash.cache_max_age || 2*4*60, prophash.cache_prefix || 'REMOVABLE');
    this.favoritesMechanics = null;
    this.subscribeMechanics = null;
    this.loadModules(prophash.verifytoken, prophash.page_access_token, prophash.modulehandler,prophash.favoriteshandler, prophash.subscribehandler).then(
      this.onCreatedListenerMethod.bind(this)
    );
    this.doCronJob();
  }
  
  ParentService.inherit(FacebookMessengerBotService, factoryCreator);
  RemoteServiceListenerServiceMixin.addMethods(FacebookMessengerBotService);
  
  FacebookMessengerBotService.prototype.__cleanUp = function() {
    this.subscribeMechanics = null;
    this.favoritesMechanics = null;
    this.cacheInvalidator = null;
    this.job_interval = null;
    this.cache = null;
    this.page_access_token = null;
    this.verifytoken = null;
    RemoteServiceListenerServiceMixin.prototype.destroy.call(this);
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

  function onModulesLoaded(verifytoken,page_access_token,respondermodule,favoritesmodule,subscribemodule){
    var responderClass = respondermodule(FacebookMessengerResponder);
    this.favoritesMechanics = new favoritesmodule.Mechanics('favorites.db');
    this.subscribeMechanics = new subscribemodule.Mechanics('subscribers.db');
    var ret = function(url, req, res){
      if (!!req.inprocess_request){ //InProcess request
        FacebookMessengerResponder.inProcessFactory(req, responderClass, this.cache, this.favoritesMechanics, this.subscribeMechanics, verifytoken, page_access_token);
        return;
      }
      if (!responderClass){
        //TODO throw
        res.end('{}');
        return;
      }
      this.extractRequestParams(url, req).then(
        FacebookMessengerResponder.factory.bind(null,res,responderClass,this.cache,this.favoritesMechanics,this.subscribeMechanics,verifytoken,page_access_token)
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

  FacebookMessengerBotService.prototype.loadModules = function(verifytoken, page_access_token, modulehandlername, favoriteshandlername, subscribehandlername){
    return execlib.loadDependencies('client',
      [
        modulehandlername,
        favoriteshandlername,
        subscribehandlername
      ],
      onModulesLoaded.bind(this,verifytoken,page_access_token)
    );
  };

  FacebookMessengerBotService.prototype.propertyHashDescriptor = {
    verifytoken: {
      type: 'string'
    },
    modulehandler: {
      type: 'string'
    }
  };

  FacebookMessengerBotService.prototype.isInitiallyReady = function(prophash){
    return false;
  };

  FacebookMessengerBotService.prototype.doCronJob = function(){
  };

  FacebookMessengerBotService.prototype.onCreatedListenerMethod = function(){
    console.log('CEK CEK');
    this.onServiceReady();
    //You must resolve readyToAcceptUsersDefer !!!
  };

  FacebookMessengerBotService.prototype.doCronJob = function(){
    if (lib.isFunction(this.cronJob)){
      this.cronJob();
      setTimeout(this.doCronJob.bind(this),this.job_interval);
    }
  };

  FacebookMessengerBotService.prototype.onServiceReady = function(){
    //inherit...
  };

  FacebookMessengerBotService.prototype.makeInProcessRequest = function(inprocObj){
    this[this.verifytoken](null,inprocObj);
  };

  
  return FacebookMessengerBotService;
}

module.exports = createFacebookMessengerBotService;
