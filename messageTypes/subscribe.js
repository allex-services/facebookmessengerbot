function createSubscribe(execlib){
  function Subscribe(jsonreq){
    this.mode = jsonreq['hub.mode'];
    this.challenge = jsonreq['hub.challenge'];
    this.verify_token = jsonreq['hub.verify_token'];
  }
  Subscribe.prototype.destroy = function(){
    this.verify_token = null;
    this.challenge = null;
    this.mode = null;
  };
  return Subscribe;
}
module.exports = createSubscribe;
