'use strict';
module.exports = {

  identity: 'interviews',

  attributes: {
    account: { model: 'accounts'},
    name: { type: 'string', required: true},
    description: { type: 'string'},
    body: { type: 'json', required: true },
    sent: {type: 'integer'},
    opened: {type: 'integer'},
    answered: {type: 'integer'}
  }
};
