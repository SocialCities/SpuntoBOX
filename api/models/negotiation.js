'use strict';
module.exports = {

  identity: 'negotiations',

  attributes: {
    account: { model: 'accounts', required: true },
    client: { mode: 'clients' },
    status: { type: 'string', enum: ['pending', 'approved', 'denied'] },
    email: { type: 'string' },
    name: { type: 'string' }
  }
};
