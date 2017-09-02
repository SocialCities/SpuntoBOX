'use strict';
module.exports = {

  identity: 'interviewsCustomers',

  attributes: {
    account: { model: 'accounts'},
    interview: {model: 'interviews'},
    customer: {model: 'customers'},
    questions: {type: 'array'},
    language: {type: 'string'}
  }
};
