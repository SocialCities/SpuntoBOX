'use strict';
module.exports = {

  identity: 'fields',

  attributes: {
    account: { model: 'accounts' },
    name: { type: 'string' },
    pattern: {type: 'string'},
    schemaType: { type: 'string', enum: ['customer']},
    type: { type: 'string', enum: ['string', 'checkbox', 'date']},
    enum: { type: 'array'},
    required: { type: 'boolean', defaultTo: false}
  }
};
