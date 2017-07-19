function createServicePack(execlib) {
  'use strict';
  return {
    service: {
      dependencies: ['allex_httpexecutorservice']
    },
    sinkmap: {
      dependencies: ['allex_httpexecutorservice']
    }, /*
    tasks: {
      dependencies: []
    }
    */
  }
}

module.exports = createServicePack;
