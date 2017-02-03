//received structure -> https://developers.facebook.com/docs/messenger-platform/webhook-reference#payload
//I only get fields that I need in the format I need
function createReceivePayload(execlib){

  //https://developers.facebook.com/docs/messenger-platform/webhook-reference#entry
  function Entry(prophash){
    this.page_id = prophash.id;
    this.timestamp = prophash.time;
    this.messaging = this.createMessaging(prophash.messaging); //TODO !!! - Very important: this can be array of messaging, I don't know how to handle array of messages, so this need to be revisited later!
  }
  Entry.prototype.destroy = function(){
    this.entries.forEach(destroyMessaging);
    this.entries = null;
    this.timestamp = null;
    this.page_id = null;
  };
  Entry.prototype.createMessaging = function(messagingArry){
    var ret = [];
    messagingArry.forEach(createMessaging.bind(null,ret));
    return ret;
  };
  function createMessaging(arry,messaging){
    arry.push(new Messaging(messaging));
  }
  function destroyMessaging(messaging){
    messaging.destroy();
  }

  //https://developers.facebook.com/docs/messenger-platform/webhook-reference#messaging
  function Messaging(prophash){
    this.sender_id = prophash.sender.id;
    this.recipient_id = prophash.recipient.id;
    this.additionalFields = null; //TODO add: Additional callback specific fields
  }
  Messaging.prototype.destroy = function(){
  };

  function ReceivePayload(jsonreq){
    this.entries = this.createEntries(jsonreq.entry); //Array containing event data - Array of entry
  }
  ReceivePayload.prototype.destroy = function(){
    this.entries.forEach(destroyEntry);
    this.entries = null;
  };
  ReceivePayload.prototype.createEntries = function(entries){
    var ret = [];
    entries.forEach(createEntry.bind(null,ret));
    return ret;
  };
  function createEntry(arry,entry){
    arry.push(new Entry(entry));
  }
  function destroyEntry(entry){
    entry.destroy();
  }

  return ReceivePayload;
}

module.exports = createReceivePayload;
