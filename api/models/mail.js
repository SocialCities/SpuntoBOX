'use strict';
module.exports = {

  identity: 'mails',

  attributes: {
    account: { model: 'accounts'},
    uuid: {type: 'string'},
    body: { type: 'string', required: true },
    fullBody: { type: 'string', required: true },
    bodyHTML: { type: 'string'},
    attachments: { type: 'array'},
    date: { type: 'datetime', required: true },
    subject: { type: 'string' },
    from: { type: 'json' },
    negotiation: { model: 'negotiations' },
    type: {type: 'string' },
    replyTo: {model: 'mails' },
    groups: { type: 'json' },
    log: {type: 'json'},
    draft: {type: 'boolean', defaultsTo: false},
    read: {type: 'boolean'},
    client: {type: 'string'},
    folders: {type: 'array'},
    status: {type: 'string', defaultsTo: 'red'},
  }
};
