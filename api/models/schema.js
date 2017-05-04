'use strict';
module.exports = {

  identity: 'schemas',

  attributes: {
    account: { model: 'accounts' },
    default: { type: 'boolean', defaultTo: false },
    schema: { type: 'json' },
    type: { type: 'string', enum: ['customer']},
  }
};