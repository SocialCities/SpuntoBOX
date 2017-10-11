'use strict';
module.exports = {

  identity: 'negotiationEntries',

  attributes: {
    account: { model: 'accounts', required: true },
    client: { model: 'clients' },
    status: { type: 'string', enum: ['pending', 'approved', 'denied'] },
    email: { type: 'string' },
    name: { type: 'string' },
    content: {type: 'string'},
    contentHtml: {type: 'string'},
    source: { type: 'string', enum: ['internet', 'phone', 'email', 'crm'] },
    subject: { type: 'string'},
    negotiation: {model: 'negotiations'},
    mail: {type: 'object'}
  }
};
