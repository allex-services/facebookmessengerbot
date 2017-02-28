//https://developers.facebook.com/docs/messenger-platform/send-api-reference#message
function createMessage(execlib){

  var lib = execlib.lib;
  var QuickReplyItem = require('./quickreplyitem.js')(execlib);

  function Message(prophash){
    if (!!prophash.text){
      this.text = prophash.text; //String - text
    }
    if (!!prophash.attachment){
      this.attachment = prophash.attachment; //https://developers.facebook.com/docs/messenger-platform/send-api-reference#attachment
    }
    if (!!prophash.quick_replies){
      if (!lib.isArray(prophash.quick_replies)){
        throw new Error('quick_replies must be an array!');
      }
      this.quick_replies = [];
      prophash.quick_replies.forEach(this.createQuickReplyItem.bind(this,this.quick_replies)); //https://developers.facebook.com/docs/messenger-platform/send-api-reference/quick-replies
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
  Message.prototype.createQuickReplyItem = function(quickRepliesArr,itemObj){
    quickRepliesArr.push(new QuickReplyItem(itemObj));
  };
  return Message;
}
module.exports = createMessage;
