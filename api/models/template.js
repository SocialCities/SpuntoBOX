'use strict';
module.exports = {

  identity: 'templates',

  attributes: {
    account: { model: 'accounts'},
    name: { type: 'string', required: true},
    description: { type: 'string'},
    body: { type: 'json', required: true },
    group: { type: 'string', required: true}
  }
};
