function createQuickReplyItem(execlib){
  function QuickReplyItem(prophash){
    //https://developers.facebook.com/docs/messenger-platform/send-api-reference/quick-replies#quick_reply
    if (!!prophash.content_type){
      this.content_type = prophash.content_type;
    }
    if (!!prophash.title){
      this.title = prophash.title;
    }
    if (!!prophash.payload){
      this.payload = prophash.payload;
    }
    if (!!prophash.image_url){
      this.image_url = prophash.image_url;
    }
  }
  QuickReplyItem.prototype.destroy = function(){
    this.content_type = null;
    this.title = null;
    this.payload = null;
    this.image_url = null;
  };
  return QuickReplyItem;
}
module.exports = createQuickReplyItem;
