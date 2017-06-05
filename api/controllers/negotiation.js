'use strict';
var htmlToText = require('html-to-text');

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
    'post /:account': [checkScopes(['user']),function(req, res, next) {
      let negotiation = {
        account: req.params.account,
        client: req.body.customerId,
        status: req.body.status,
        subject: req.body.subject,
        email: req.body.email,
        name: req.body.name + ' ' + req.body.surname,
        source: req.body.source,
        type: req.body.type
      }

      let negotiationEntry = {
        account: req.params.account,
        client: req.body.customerId,
        status: req.body.status,
        subject: req.body.subject,
        email: req.body.email,
        name: req.body.name + ' ' + req.body.surname,
        content: htmlToText.fromString(req.body.content),
        contentHtml: req.body.content,
        source: req.body.source
      }

      Model.negotiations.create(negotiation).then((n) => {
        console.log(n)
        negotiationEntry.negotiation = n.id;

        return Model.negotiationentries.create(negotiationEntry);
      }).then((ne) => {
        res.send(ne);
      }).catch((err) => {
        console.log('error', err);
        res.status(500).send(err)
      });
    }],
    'get /:account/mails/:id': [checkScopes(['user']),function(req, res, next) {
      console.log({account: req.params.account, negotiation: req.params.id})
      Model.negotiationentries.find({account: req.params.account, negotiation: req.params.id}).then((negs) => {
        res.send(negs);
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
