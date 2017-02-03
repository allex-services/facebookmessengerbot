function createMessageTypes(execlib){
  return {
    Subscribe: require('./subscribe.js')(execlib),
    ReceivePayload: require('./receivepayload.js')(execlib),
    SendPayload: require('./sendpayload.js')(execlib),
    Message: require('./message.js')(execlib),
    Recipient : require('./recipient.js')(execlib)
  };
}

module.exports = createMessageTypes;
