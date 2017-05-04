'use strict';

module.exports = {
  path: '/customers',
  actions: {
    'get /:accountId/search': [function(req, res, next) {
      console.log('queryyyy', req.query)
      let content = req.query.content;
      let query = {account: req.params.accountId}
      if (content) {
        query.or = [
          { name: {'contains': content} },
          { surname: {'contains': content} },
          { email: {'contains': content}}        
        ];
      }
      if (req.query.group) {
        query.group = req.query.group;
      }
    console.log('queryz', query)
      Model.customers.find(query).then((customers) => {
        
        console.log(customers)
        res.send(customers);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }],
    'get /:accountId/search-contacts/:content': [function(req, res, next) {
      let query = {account: req.params.accountId}
      query.or = [
        { name: {'contains': req.params.content} },
        { surname: {'contains': req.params.content} },
        { email: {'contains': req.params.content}}        
      ];
      Model.customers.find(query).then((customers) => {
        customers = customers.map((c) => {
          return {
            value: c.email,
            text: c.name + ' ' + c.surname + ' <' + c.email + '>'
          }
        });
        res.send(customers);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }],
    'get /:account/:customerId': [function(req, res, next) {
      console.log(req.params.customerId)
      console.log(req.params.account)
      Model.customers.findOne({account: req.params.account, id: req.params.customerId}).then((customer) => {
        
        console.log(customer)
        console.log('customer ^^')
        res.send(customer);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }],
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
      Model.customers.create(customer).then((customer) => {
        console.log('customer')
        console.log(customer)
        res.send(customer);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }],
    'put /:account/:customerId': [function(req, res, next) {
      Model.customers.update({account: req.params.account, id: req.params.customerId}, req.body).then((customer) => {
        console.log('customer')
        console.log(customer)
        res.send(customer);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }],
    'delete /:account/:customerId': [function(req, res, next) {

      let customer = req.body;
      customer.account = req.params.account;
      Model.customers.destroy({id: req.params.customerId, account: req.params.account}).then((customer) => {
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
