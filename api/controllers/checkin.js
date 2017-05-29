'use strict';

module.exports = {
  path: '/checkins',
  actions: {
    'get /:accountId/search': [function(req, res, next) {
      console.log('queryyyy', req.query)
      let content = req.query.content;
      let query = {account: req.params.accountId}
      if (content) {
        query.or = [
          { 'guests.name': {'contains': content} },
          { 'guests.surname': {'contains': content} },
          { 'guests.email': {'contains': content}}        
        ];
      }
      if (req.query.group) {
        query.group = req.query.group;
      }
    console.log('queryz', query)
      Model.checkins.find(query).then((checkins) => {
        
        console.log(checkins)
        res.send(checkins);
      }).catch((err) => {
        console.log('checkins Error', err);
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
        customers = customers.map(customer => {
          customer.textField = `${customer.name} ${customer.surname} - ${customer.email}`;
          
          return customer;
        })
        res.send(customers);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }],
    'get /:account/:checkinId': [function(req, res, next) {
      console.log(req.params.checkinId)
      console.log(req.params.account)
      Model.checkins.findOne({account: req.params.account, id: req.params.checkinId}).then((checkin) => {
        
        console.log(checkin)
        console.log('checkin ^^')
        res.send(checkin);
      }).catch((err) => {
        console.log('checkin Error', err);
      })
    }],
    'get /:account': [function(req, res, next) {
      Model.checkins.find({account: req.params.account}).then((checkins) => {
        res.send(checkins);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }],
    'post /:account': [function(req, res, next) {
      let checkin = req.body;
      checkin.account = req.params.account;
      checkin.daysInterview = parseInt(checkin.daysInterview || 0);
      Model.checkins.create(checkin).then((checkin) => {
        console.log('customer')
        console.log(checkin)
        res.send(checkin);
      }).catch((err) => {
        console.log('checkin Error', err);
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
