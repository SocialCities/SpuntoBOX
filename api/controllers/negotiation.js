'use strict';

module.exports = {
  path: '/negotiations',
  actions: {
    'get /:account/': [function(req, res, next) {
      Model.negotiations.find({account: req.params.account}).then((negotiations) => {
        res.send(negotiations);
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
