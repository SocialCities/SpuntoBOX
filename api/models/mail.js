'use strict';
module.exports = {

  identity: 'mails',

  attributes: {
    account: { model: 'accounts'},
    body: { type: 'string', required: true },
    fullBody: { type: 'string', required: true },
    bodyHTML: { type: 'string'},
    attachments: { type: 'array'},
    date: { type: 'datetime', required: true },
    subject: { type: 'string', required: true },
    from: { type: 'json', required: true },
    negotiation: { model: 'negotiations' }
  }
};
