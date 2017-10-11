'use strict';
module.exports = {

  identity: 'negotiations',

  attributes: {
    account: { model: 'accounts', required: true },
    client: { model: 'clients' },
    guest: { type: 'json' },
    proposals: {type: 'array'},
    header: {type: 'string'},
    footer: {type: 'string'},
    status: { type: 'string', enum: ['pending', 'approved', 'denied', 'closed'] },
    email: { type: 'string' },
    name: { type: 'string' },
    subject: {type: 'string'},
    source: { type: 'string', enum: ['internet', 'phone', 'email', 'crm'] },
    type: { type: 'string' }
  }
};
