function createMessageTypes(execlib){
  return {
    Subscribe: require('./subscribe.js')(execlib),
    ReceivePayload: require('./receivepayload.js')(execlib),
    SendPayload: require('./sendpayload.js')(execlib),
    Message: require('./message.js')(execlib),
    Attachment: require('./attachment.js')(execlib),
    Recipient : require('./recipient.js')(execlib),
    ThreadSetting : require('./threadsetting.js')(execlib),
    InProcessRequest : require('./inprocessrequest.js')(execlib)
  };
}

module.exports = createMessageTypes;
