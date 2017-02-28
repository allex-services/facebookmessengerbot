function createAttachment(execlib){
  function Attachment(prophash){
    if (!!prophash.type){
      this.type = prophash.type;
    }
    if (!!prophash.payload){
      this.payload = prophash.payload;
    }
  }
  Attachment.prototype.destroy = function(){
    this.payload = null;
    this.type = null;
  };
  return Attachment;
}
module.exports = createAttachment;
