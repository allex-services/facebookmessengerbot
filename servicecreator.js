function createFacebookMessengerBotService(execlib, ParentService) {
  'use strict';
  

  function factoryCreator(parentFactory) {
    return {
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')),
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')) 
    };
  }

  function FacebookMessengerBotService(prophash) {
    ParentService.call(this, prophash);
  }
  
  ParentService.inherit(FacebookMessengerBotService, factoryCreator);
  
  FacebookMessengerBotService.prototype.__cleanUp = function() {
    ParentService.prototype.__cleanUp.call(this);
  };
  
  return FacebookMessengerBotService;
}

module.exports = createFacebookMessengerBotService;
