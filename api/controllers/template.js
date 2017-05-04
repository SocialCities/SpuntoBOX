'use strict';

module.exports = {
  path: '/templates',
  actions: {
    'get /:account': [function(req, res, next) {
      Model.templates.find({account: req.params.account}).sort('createdAt DESC').then((templates) => {
        res.send(templates);
      }).catch((err) => {
        console.log('templates Error', err);
      })
    }],
    'post /:account': [function(req, res, next) {
      console.log(req.body)
      let customer = req.body;
      customer.account = req.params.account;
      Model.templates.create(req.body).then((template) => {
        console.log('template')
        console.log(template)
        res.send(template);
      }).catch((err) => {
        console.log('template Error', err);
      })
    }]
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
