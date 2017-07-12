'use strict';
module.exports = {

  identity: 'folders',

  attributes: {
    account: { model: 'accounts' },
    parent: {model: 'folders'},
    name: { type: 'string' }
  }
};
