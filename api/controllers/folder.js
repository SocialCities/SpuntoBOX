'use strict';
var htmlToText = require('html-to-text');

module.exports = {
  path: '/folders',
  actions: {
    'get /:account': [checkScopes(['user']),function(req, res, next) {
      Model.folders.find({account: req.params.account}).sort('updatedAt ASC').then((folders) => {
        res.send(folders);
      }).catch((err) => {
        console.log('folders Error', err);
      })
    }],
    'post /:account': [checkScopes(['user']),function(req, res, next) {
      let folder = req.body;
      folder.account = req.params.account;

      Model.folders.create(folder).then((n) => {
        console.log(n)
        return Model.folders.find({account: req.params.account}).sort('updatedAt ASC');
      }).then((folders) => {
        res.send(folders);
      }).catch((err) => {
        console.log('folders Error', err);
      });
    }]
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
