function createFacebookMessengerBotService(execlib, ParentService) {
  'use strict';
  
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry,
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
    this.defaultCountry = prophash.default_country;
    this.botName = prophash.bot_name;
    this.botNamePP = prophash.bot_name_pp;
    this.cdnSubDomain = prophash.cdn_subdomain;
    this.job_interval = prophash.job_interval || 15 * 1000;
    this.removablePrefix = prophash.removable_prefix || 'REMOVABLE';
    this.cache.add('removable_prefix',this.removablePrefix);
    this.cacheInvalidator = new CacheInvalidator(this.cache, this.job_interval, prophash.cache_max_age || 2*60, this.removablePrefix);
    this.favoritesMechanics = null;
    this.subscribeMechanics = null;
    this.blazeMechanics = null;
    this.findRemoteWithAddress('cdn0');
    this.loadModules(prophash.verifytoken, prophash.page_access_token, prophash.modulehandler,prophash.favoriteshandler, prophash.subscribehandler, prophash.userdatahandler, prophash.blazehandler).then(
      this.onCreatedListenerMethod.bind(this)
    );
  }
  
  ParentService.inherit(FacebookMessengerBotService, factoryCreator);
  RemoteServiceListenerServiceMixin.addMethods(FacebookMessengerBotService);
  
  FacebookMessengerBotService.prototype.__cleanUp = function() {
    this.blazeMechanics = null;
    this.subscribeMechanics = null;
    this.favoritesMechanics = null;
    this.cacheInvalidator = null;
    this.job_interval = null;
    this.cdnSubdomain = null;
    this.botNamePP = null;
    this.botName = null;
    this.defaultCountry = null;
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

  function onModulesLoaded(verifytoken,page_access_token,respondermodule,favoritesmodule,subscribemodule,userdatamodule,blazemodule){
    var responderClass = respondermodule(FacebookMessengerResponder);
    this.favoritesMechanics = new favoritesmodule.Mechanics('favorites.db');
    this.subscribeMechanics = new subscribemodule.Mechanics('subscribers.db');
    this.userDataMechanics = new userdatamodule.Mechanics('userdata.db');
    this.blazeMechanics = new blazemodule.Mechanics('blaze.db','blazequeue.db');
    var ret = function(url, req, res){
      if (!!req.inprocess_request){ //InProcess request
        FacebookMessengerResponder.inProcessFactory(req, responderClass, this);
        return;
      }
      if (!responderClass){
        //TODO throw
        res.end('{}');
        return;
      }
      this.extractRequestParams(url, req).then(
        FacebookMessengerResponder.factory.bind(null,res,responderClass,this)
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

  FacebookMessengerBotService.prototype.loadModules = function(verifytoken, page_access_token, modulehandlername, favoriteshandlername, subscribehandlername, userdatahandlername, blazehandlername){
    return execlib.loadDependencies('client',
      [
        modulehandlername,
        favoriteshandlername,
        subscribehandlername,
        userdatahandlername,
        blazehandlername
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

  FacebookMessengerBotService.prototype.onCreatedListenerMethod = function(){
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

  FacebookMessengerBotService.prototype.uploadToCDN = execSuite.dependentServiceMethod([],['cdn0'],function(cdn0sink,localPath,remoteFileName,defer){
    console.log('-------- IDE LI TO??', localPath, '=>', remoteFileName, 'na', this.state.get('cdn0_address'));
    taskRegistry.run('transmitFile', {
      sink: cdn0sink,
      ipaddress: this.state.get('cdn0_address'),
      filename: localPath,
      remotefilename: remoteFileName,
      cb: function () {
        console.log('OTISLO', arguments);
        defer.resolve(arguments[0]);
        defer = null;
      }
      //cb: defer.resolve.bind(defer)
    });
  });

  
  return FacebookMessengerBotService;
}

module.exports = createFacebookMessengerBotService;
