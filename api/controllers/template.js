'use strict';

module.exports = {
  path: '/templates',
  actions: {
    'get /:accountId/search-side': [function(req, res, next) {
      console.log('queryyyy', req.query)
      let query = {account: req.params.accountId}
      if (req.query.language) {
        query['body.' + req.query.language] = {$exists: true};
      }

      if (req.query.zone) {
        query.group = req.query.zone;
      }

      let content = req.query.content;
      if (content) {
        query.or = [
          { name: {'contains': content} },
          { "body.it": {'contains': content} },
          { "body.en": {'contains': content}}        
        ];
      }

      Model.templates.find(query).sort('createdAt DESC').then((templates) => {
        let tpls = [];
        templates.forEach( t => {
          if (req.query.language) {
            t.body = t.body[req.query.language];
            tpls.push(t);
          } else {
            tpls.push(t);
          }
        });
        res.send(tpls);
      }).catch((err) => {
        res.status(500).send({error: 'Error retrieving the templates'});
        console.log('templates Error', err);
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

      Model.templates.find(query).sort('createdAt DESC').then((templates) => {
        res.send(templates);
      }).catch((err) => {
        res.status(500).send({error: 'Error retrieving the templates'});
        console.log('templates Error', err);
      })
    }],
    'delete /:accountId/:templateId': [function (req, res, next) {
      Model.templates.destroy({account: req.params.accountId, id: req.params.templateId}).then((template) => {
        res.send(template);
      }).catch((err) => {
        console.log('template Error', err);
      })
    }],
    'delete /:accountId/:templateId/:language': [function (req, res, next) {
      Model.templates.findOne({account: req.params.accountId, id: req.params.templateId}).then((template) => {
        delete template.body[req.params.language];
        return template.save();
      }).then(template => {
        res.send(template);
      }).catch((err) => {
        console.log('template Error', err);
      })
    }],

    'get /:account': [function(req, res, next) {
      Model.templates.find({account: req.params.account}).sort('createdAt DESC').then((templates) => {
        res.send(templates);
      }).catch((err) => {
        console.log('templates Error', err);
      })
    }],
    'get /:account/:templateId': [function(req, res, next) {
      Model.templates.findOne({account: req.params.account, id: req.params.templateId}).then((template) => {
        res.send(template);
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
    }],
    'put /:account/:templateId': [function(req, res, next) {
      let data = req.body;
      Model.templates.update({account: req.params.account, id: req.params.templateId}, data).then((template) => {

        res.send(template);
      }).catch((err) => {
        console.log('templates Error', err);
      })
    }],
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
