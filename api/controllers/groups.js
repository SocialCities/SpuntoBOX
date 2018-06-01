'use strict';
var htmlToText = require('html-to-text');

module.exports = {
  path: '/groups',
  actions: {
    'get /:account': [checkScopes(['user']),function(req, res, next) {
      Model.groups.find({account: req.params.account}).sort('updatedAt ASC').then((groups) => {
        res.send(groups);
      }).catch((err) => {
        console.log('groups Error', err);
      })
    }],
    'post /:account': [checkScopes(['user']),function(req, res, next) {
      let group = req.body;
      group.name = (req.body.name || '').toLowerCase();
      group.account = req.params.account;
      Model.groups.find({account: req.params.account, name: group.name}).then((groups) => {
        if (groups.length > 0) {
          return Promise.reject('Already exists')
        }

        return Model.groups.create(group);
      }).then((n) => {
        console.log(n)
        return Model.groups.find({account: req.params.account}).sort('updatedAt ASC');
      }).then((groups) => {
        res.send(groups);
      }).catch((err) => {
        res.status(500).send(err)
        console.log('groups Error', err);
      });
    }],
    'delete /:account/:groupsId': [checkScopes(['user']),function(req, res, next) {
      let group = {};
      group.account = req.params.account;
      group.id = req.params.groupId;
      Model.groups.destroy(group).then((err, asd) => {
        console.log(err, asd)
        res.send(asd || {});
      }).catch((err) => {
        console.log('groups Error', err);
      });
    }]
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
