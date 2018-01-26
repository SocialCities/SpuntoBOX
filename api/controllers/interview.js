'use strict';
var Mustache = require("mustache")

module.exports = {
  path: '/interviews',
  actions: {
    'get /i/:interviewId/:customerId/:language': [function(req, res, next) {
      let i, c
      Model.interviews.findOne({id: req.params.interviewId}).then((interview) => {
        i = interview
        interview.opened = (interview.opened || 0) + 1;

        interview.save();
        return Model.accounts.findOne({id: interview.account});
      }).then(account => {
        i.settings = account.interviste || {}

        return Model.customers.findOne({id: req.params.customerId})
      }).then((customer) => {
        c = customer;
        Object.keys(i.body).forEach((key) => {
          let l = i.body[key]
          let cust = {}
          if (c) {
            cust = {
              nome: c.name,
              cognome: c.surname
            };
          }
          
          l.header = Mustache.render(l.header || '', {cliente: cust});
          l.footer = Mustache.render(l.footer || '', {cliente: cust});
          i.body[key] = l;
        });
        
        res.send(i);
      }).catch((error) => {
        res.status(500).send(error);
        console.log('interview error', error)
      });
    }],
    'post /customer': [function(req, res, next) {
      let interviewCustomer = req.body;
      let int;
      Model.interviews.findOne({id: req.body.interview}).then((interview) => {
        interviewCustomer.account = interview.account;

        interview.answered = parseInt((interview.answered || 0) + 1);
        console.log('answered', typeof interview.answered);
        return interview.save();        
      }).then(() => {
        return Model.interviewscustomers.create(interviewCustomer);
      }).then((inter) => {
        res.send({inter})
      }).catch((e) => {
        res.status(500).send(e);
        console.log('interview error', e)
      })
    }],
    'get /:accountId/search': [function(req, res, next) {
      console.log('queryyyy', req.query)
      let query = {account: req.params.accountId}
      if (req.query.language) {
        query['body.' + req.query.language] = {$exists: true};
      }

      if (req.query.type) {
        query.type = req.query.type;
      }

      let content = req.query.content;
      if (content) {
        query.or = [
          { name: {'contains': content} },
          { "body.it": {'contains': content} },
          { "body.en": {'contains': content}}        
        ];
      }

      Model.interviews.find(query).sort('createdAt DESC').then((interviews) => {
        res.send(interviews);
      }).catch((err) => {
        res.status(500).send({error: 'Error retrieving the interviews'});
        console.log('interviews Error', err);
      })
    }],

    'get /:account': [function(req, res, next) {
      Model.interviews.find({account: req.params.account}).sort('createdAt DESC').then((templates) => {
        res.send(templates);
      }).catch((err) => {
        console.log('templates Error', err);
      })
    }],
    'get /:account/:interviewId': [function(req, res, next) {
      Model.interviews.findOne({account: req.params.account, id: req.params.interviewId}).then((interview) => {
        res.send(interview);
      }).catch((err) => {
        console.log('interview Error', err);
      })
    }],
    'post /:account': [function(req, res, next) {
      console.log(req.body)
      let interview = req.body;
      interview.account = req.params.account;
      interview.sent = 0;
      interview.opened = 0;
      Model.interviews.create(interview).then((interview) => {
        console.log('interview')
        console.log(interview)
        res.send(interview);
      }).catch((err) => {
        console.log('interview Error', err);
      })
    }],
    'put /:account/:interviewId': [function(req, res, next) {
      let data = req.body;
      Model.interviews.update({account: req.params.account, id: req.params.interviewId}, data).then((interview) => {

        res.send(interview);
      }).catch((err) => {
        console.log('interview Error', err);
      })
    }],
    'delete /:account/:interviewId': [function(req, res, next) {
      let interview = req.body;
      interview.account = req.params.account;
      Model.interviews.destroy({id: req.params.interviewId, account: req.params.account}).then((interview) => {
        console.log('interview')
        console.log(interview)
        res.send(interview);
      }).catch((err) => {
        console.log('interview Error', err);
      })
    }]
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
