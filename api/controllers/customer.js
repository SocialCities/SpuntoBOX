'use strict';

module.exports = {
  path: '/customers',
  actions: {
    'get /:account': [function(req, res, next) {
      Model.customers.find({account: req.params.account}).then((customers) => {
        res.send(customers);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }],
    'post /:account': [function(req, res, next) {
      console.log(req.body)
      let customer = req.body;
      customer.account = req.params.account;
      Model.customers.create(req.body).then((customer) => {
        console.log('customer')
        console.log(customer)
        res.send(customer);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }]
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
