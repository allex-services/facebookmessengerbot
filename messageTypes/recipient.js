function createRecipient(execlib){
  function Recipient(prophash){
    if (!!prophash.phone_number){
      this.phone_number = prophash.phone_number; //Phone number of the recipient with the format +1(212)555-2368. Your bot must be approved for Customer Matching to send messages this way.
    }
    if (!!prophash.id){
      this.id = prophash.id; //ID of recipient
    }
  }
  Recipient.prototype.destroy = function(){
    this.id = null;
    this.phone_number = null;
  };
  return Recipient;
}
module.exports = createRecipient;
