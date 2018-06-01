'use strict';
module.exports = {

  identity: 'groups',

  attributes: {
    account: { model: 'accounts'},
    name: { type: 'string', required: true}
  }
};
