function createThreadSetting(execlib){
  function ThreadSetting(prophash){
    if (!!prophash.setting_type){
      this.setting_type = prophash.setting_type; //ID of recipient
    }
    if (!!prophash.thread_state){
      this.thread_state = prophash.thread_state; //ID of recipient
    }
    if (!!prophash.call_to_actions){
      this.call_to_actions = prophash.call_to_actions; //ID of recipient
    }
    if (!!prophash.greeting){
      this.greeting = prophash.greeting; //ID of recipient
    }
  }
  ThreadSetting.prototype.destroy = function(){
    this.setting_type = null;
    this.thread_state = null;
    this.call_to_actions = null;
    this.greeting = null;
  };
  return ThreadSetting;
}
module.exports = createThreadSetting;
