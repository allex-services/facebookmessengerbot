//https://developers.facebook.com/docs/messenger-platform/send-api-reference#message
function createMessage(execlib){
  function Message(prophash){
    if (!!prophash.text){
      this.text = prophash.text; //String - text
    }
    if (!!prophash.attachment){
      this.attachment = null; //TODO, currently not supported -> https://developers.facebook.com/docs/messenger-platform/send-api-reference#attachment
    }
    if (!!prophash.quick_replies){
      this.quick_replies = null; //TODO, currently not supported -> https://developers.facebook.com/docs/messenger-platform/send-api-reference/quick-replies
    }
    if (!!prophash.metadata){
      this.metadata = prophash.metadata; //Custom string that is delivered as a message echo. -> https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-echo
    }
  }
  Message.prototype.destroy = function(){
    this.metadata = null;
    this.quick_replies = null;
    this.attachment = null;
    this.text = null;
  };
  return Message;
}
module.exports = createMessage;
