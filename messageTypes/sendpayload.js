function createPayload(execlib){
  function Payload(prophash){
    if (!!prophash.recipient){
      this.recipient = prophash.recipient; //Object - https://developers.facebook.com/docs/messenger-platform/send-api-reference#recipient
    }
    if (!!prophash.message){
      this.message = prophash.message; //Object - https://developers.facebook.com/docs/messenger-platform/send-api-reference#message
    }
    if (!!prophash.sender_action){
      this.sender_action = prophash.sender_action; //String - typing_on, typing_off, mark_seen
    }
    if (!!prophash.notification_type){
      this.notification_type = prophash.notification_type; //String - REGULAR, SILENT_PUSH, or NO_PUSH
    }
  }
  Payload.prototype.destroy = function(){
    this.recipient = null;
    this.message = null;
    this.sender_action = null;
    this.notification_type = null;
  };
  return Payload;
}
module.exports = createPayload;
