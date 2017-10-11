'use strict';
var htmlToText = require('html-to-text');
var Mustache = require("mustache")

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
    'get /:account/:negotiation': [checkScopes(['user']),function(req, res, next) {
      Model.negotiations.findOne({id: req.params.negotiation}).then((negotiation) => {
        res.send(negotiation);
      }).catch((err) => {
        console.log('negotiations Error', err);
      })
    }],
    'post /:account/:negotiation/chat': [checkScopes(['user']),function(req, res, next) {
      let body;
      let email = {};
      let groups = {};
      let nego;
      Model.negotiations.findOne({id: req.params.negotiation}).then(negotiation => {
        nego = negotiation;
        return Model.customers.findOne({id: negotiation.client, account: req.params.account});
      }).then(customer => {
        if (customer.group) {
          groups[customer.group] = true;
        }
        let cust = {
          nome: customer.name,
          cognome: customer.surname
        };
        body = Mustache.render(req.body.text, {cliente: cust});

        email.negotiation = nego.id;
        email.account = req.params.account;
        email.body = htmlToText.fromString(body);
        email.fullBody = email.body;
        email.bodyHTML = body;
        email.subject = 'Proposta trattativa';
        email.date = new Date();
        email.to = nego.guest.email;
        email.type = 'sent';
        email.groups = groups;
        email.draft = false;
        if (req.body.replyTo) {
          email.replyTo = req.body.replyTo;
        }
        return Model.accounts.findOne(req.params.account);
      }).then((account) => {
        email.from = account.email;
        return Service.Mail.sendEmail(email, account.smtp);
      }).then((receipt) => {
        email.log = receipt;
        return Model.mails.create(email);
      }).then((mail) => {

        let negotiationEntry = {
          negotiation: nego.id,
          account: req.params.account,
          client: nego.client,
          subject: email.subject,
          email: email.to,
          name: nego.guest.name + ' ' + nego.guest.surname,
          content: htmlToText.fromString(body),
          contentHtml: body,
          source: 'crm',
          type: 'sent'
        }

        return Model.negotiationentries.create(negotiationEntry);
      }).then((ne) => {
        res.send(ne);
      }).catch(e => {
        console.log('error negotiations', e);
        res.send(500, {error: JSON.stringify(e)})
      })
    }],
    'post /:account': [checkScopes(['user']),function(req, res, next) {
      let negotiation = {
        account: req.params.account,
        client: req.body.guest.id,
        guest: req.body.guest,
        header: req.body.header,
        footer: req.body.footer,
        proposals: req.body.proposals
      }

      const parsedEmail = Service.Negotiation.generateEmail(negotiation);
      let body;
      let email = {};
      let groups = {};
      let negot = nego;
      Model.customers.findOne({email: negotiation.guest.email, account: req.params.account}).then((customer) => {
        if (customer.group) {
          groups[customer.group] = true;
        }
        let cust = {
          nome: customer.name,
          cognome: customer.surname
        };
        body = Mustache.render(parsedEmail, {cliente: cust});
        return Model.negotiations.create(negotiation);
      }).then((nego) => {
        negot = nego;
        email.negotiation = negotiation.id || nego.id;
        email.account = req.params.account;
        email.body = htmlToText.fromString(body);
        email.fullBody = email.body;
        email.bodyHTML = body;
        email.subject = 'Proposta trattativa';
        email.date = new Date();
        email.to = negotiation.guest.email;
        email.type = 'sent';
        email.groups = groups;
        email.draft = false;
        if (req.body.replyTo) {
          email.replyTo = req.body.replyTo;
        }
        return Model.accounts.findOne(req.params.account);
      }).then((account) => {
        email.from = account.email;
        return Service.Mail.sendEmail(email, account.smtp);
      }).then((receipt) => {
        email.log = receipt;
        return Model.mails.create(email);
      }).then((mail) => {

        let negotiationEntry = {
          negotiation: negotiation.id || negot.id,
          account: req.params.account,
          client: req.body.guest.id,
          subject: email.subject,
          email: email.to,
          name: req.body.guest.name + ' ' + req.body.guest.surname,
          content: htmlToText.fromString(body),
          contentHtml: body,
          source: req.body.source,
          type: 'sent'
        }

        return Model.negotiationentries.create(negotiationEntry);
      }).then((ne) => {
        res.send(ne);

      }).catch((err) => {
        console.log('error', err);
        res.status(500).send(err)
      });
    }],
    'get /:account/mails/:id': [checkScopes(['user']),function(req, res, next) {
      let nego;
      Model.negotiations.findOne({account: req.params.account, id: req.params.id}).then(negotiation => {
        nego = negotiation;
        return Model.negotiationentries.find({account: req.params.account, negotiation: req.params.id}).sort('createdAt ASC');
      }).then((negs) => {
        res.send({negotiation: nego, chats: negs});
      }).catch((err) => {
        console.log('negotiations Error', err);
      })
    }],
    'patch /:account/:negotiation/archive': [function(req, res, next) {
      let nego;
      Model.negotiations.findOne({account: req.params.account, id: req.params.negotiation}).then((negotiation) => {
        negotiation.type = 'chiusa';
        negotiation.status = 'closed';
        
        nego = negotiation;
        return negotiation.save();
      }).then((customer) => {
        res.send(nego);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }],
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
