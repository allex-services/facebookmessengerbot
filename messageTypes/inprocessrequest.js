function createInProcessRequest(execlib){

  var lib = execlib.lib;

  function InProcessRequest(prophash){
    this.inprocess_request = prophash.inprocess_request;
    this.data = prophash.data;
  }
  InProcessRequest.prototype.destroy = function(){
    this.data = null;
    this.inprocess_request = null;
  };
  return InProcessRequest;
}

module.exports = createInProcessRequest;

