'use strict';

module.exports = {
  path: '/negotiations',
  actions: {
    'get /:account': [checkScopes(['user']),function(req, res, next) {
      Model.negotiations.find({account: req.params.account}).then((negotiations) => {
        res.send(negotiations);
      }).catch((err) => {
        console.log('negotiations Error', err);
      })
    }],
    'get /:account/mails/:id': [checkScopes(['user']),function(req, res, next) {
      Model.mails.find({account: req.params.account, negotiation: req.params.id}).then((mails) => {
        res.send(mails);
      }).catch((err) => {
        console.log('negotiations Error', err);
      })
    }]
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
