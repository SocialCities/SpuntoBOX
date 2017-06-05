'use strict';
module.exports = {

  identity: 'negotiations',

  attributes: {
    account: { model: 'accounts', required: true },
    client: { model: 'clients' },
    status: { type: 'string', enum: ['pending', 'approved', 'denied'] },
    email: { type: 'string' },
    name: { type: 'string' },
    subject: {type: 'string'},
    source: { type: 'string', enum: ['internet', 'phone', 'email'] },
    type: { type: 'string' }
  }
};
