'use strict';
module.exports = {

  identity: 'accounts',

  attributes: {
    email: { type: 'email', required: true, unique: true },
    name: { type: 'string', required: true },
    imap: { type: 'json', required: true},
    smtp: { type: 'json', required: true},
    lastCheck: { type: 'datetime'},
    latestChecked: { type: 'string'},
    latestUid: {type: 'integer', defaultsTo: 0}
  }

};
