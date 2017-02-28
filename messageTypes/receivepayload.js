//received structure -> https://developers.facebook.com/docs/messenger-platform/webhook-reference#payload
//I only get fields that I need in the format I need
function createReceivePayload(execlib){

  //https://developers.facebook.com/docs/messenger-platform/webhook-reference#entry
  function Message(prophash,message){
    this.page_id = prophash.id;
    this.timestamp = prophash.time;
    //https://developers.facebook.com/docs/messenger-platform/webhook-reference#messaging
    this.message = message; //TODO !!! - Very important: this can be array of messaging, I don't know how to handle array of messages, so this need to be revisited later!
  }
  Message.prototype.destroy = function(){
    this.message = null;
    this.timestamp = null;
    this.page_id = null;
  };
  function ReceivePayload(jsonreq){
    this.entries = this.createEntries(jsonreq.entry); //Array containing event data - Array of entry
  }
  ReceivePayload.prototype.destroy = function(){
    this.entries.forEach(destroyMessage);
    this.entries = null;
  };
  ReceivePayload.prototype.createEntries = function(entries){
    var ret = [];
    entries.forEach(createMessage.bind(null,ret));
    return ret;
  };
  function createMessage(arry,entry){
    entry.messaging.forEach(createMessageWithMessage.bind(null,arry,entry));
  }
  function createMessageWithMessage(arry,entry,message){
    arry.push(new Message(entry,message));
  }
  function destroyMessage(entry){
    entry.destroy();
  }

  return ReceivePayload;
}

module.exports = createReceivePayload;
