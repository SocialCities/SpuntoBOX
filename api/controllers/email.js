'use strict';
var htmlToText = require('html-to-text');
var Mustache = require("mustache")
var path = require("path");

function addCustomer(e, account) {
  console.log('add fucking customer')
  Model.customers.create({email: e, account: account}).then((em) => {
    console.log(em)
  }).catch(err => {
    console.log('err', err)
  })
}

module.exports = {
  path: '/emails',
  actions: {
    'get /test': [function (req, res, next) {
      console.log('test')
      //ULTRA TEST
      Model.accounts.findOne('581c6d4a77c87d25021db5de').then((account) => {
        console.log('test2')
        return Service.EmailFetcher.fetchEmails(account).then((result) => {
          console.log('tes3')
          let context = {sockets: this.sockets, account: account, latest: -1};
          forEachPromise(result, saveMails, context).then(() => {
            console.log('done');
            console.log('fuckingLatest', context.latest);
            const latest = parseInt(context.latest);
            if (!account.latestUid || account.latestUid < latest) {
              account.latestUid = latest;
            }
            console.log(account);
            return account.save();
          }).then((account) => {
            console.log(account)
            res.send({done: true});
          }).catch((err) => {
            res.send(err)
          });
          // Service.MailImporter.saveSingleMail(account, m).then((mail) => {
          //   this.sockets.to('account-' + account.id).emit('mail-notification', mail);
          //   console.log('saved', mail)
          // }).catch((err) => {
          //   console.log('super error', err);
          // })
        });
      }).catch(error => 
      {console.log('mega error', error)});
    }],
    'post /:accountId/send': [function (req, res, next) {
      let email = {};
      let emails = [];
      emails = emails.concat(req.body.to || []);
      emails = emails.concat(req.body.cc || []);
      emails = emails.concat(req.body.bcc || []);
      let groups = {};
      let toAdd = {};
      Model.customers.find({email: emails, account: req.params.accountId}).then((customers) => {
        customers.forEach((c) => {
          if (c.group) groups[c.group] = true;
        });
        console.log('looking for customers')
        emails.forEach(e => {
          console.log('looking for customer: ', e)
          let found = false;
          customers.forEach(c => {
            if (e === c.email) {
              console.log('customer found: ', e);
              found = true;
            }
          });
          if (found === false) {
            console.log('customer not found: ', e)
            addCustomer(e, req.params.accountId);
          }
        })
        console.log('contentHtml', req.body.contentHtml);
        console.log(htmlToText.fromString(req.body.contentHtml));
        let body = req.body.contentHtml;
        if (req.body.contentHtml.match(/{{\s*[\w\.]+\s*}}/) !== null) {
          if (req.body.to.length > 1) {
            return new Promise((resolve, reject) => {
                reject("Email ha tags, non puo' essere inviata a piu' persone.")
            });
          }
          let emailToFind = req.body.to[0];
          let cust = false;
          customers.forEach((c) => {
            if (emailToFind === c.email) {
              cust = {
                nome: c.name,
                cognome: c.surname
              };
            }
          });
          if (cust!== false) {
            body = Mustache.render(body, {cliente: cust});
          }
        }
        email.attachments = (req.body.attachments || []).filter((att) => {return att}).map((att) => {
          if (!att) return false;
          const f = att.file.split('.');
          return {
            savedFile: att.file,
            filename: att.filename,
            size: att.size,
            uuid: f[0]
          }
        });

        email.account = req.params.accountId;
        email.body = htmlToText.fromString(body);
        email.fullBody = email.body;
        email.bodyHTML = body;
        email.subject = req.body.subject;
        email.date = new Date();
        email.to = req.body.to;
        email.cc = req.body.cc;
        email.bcc = req.body.bcc;
        email.type = 'sent';
        email.groups = groups;
        email.draft = false;
        if (req.body.replyTo) {
          email.replyTo = req.body.replyTo;
        }
        return Model.accounts.findOne(req.params.accountId);
      }).then((account) => {
        email.from = account.email;
        return Service.Mail.sendEmail(email, account.smtp);
      }).then((receipt) => {
        email.log = receipt;
        return Model.mails.create(email);
      }).then((mail) => {
        res.send(mail)
      }).catch((err) => {
        res.status(500).send(err);
        console.log('mails Error', err);
      })
    }],
    'post /:accountId/drafts': [function (req, res, next) {
      if (req.body.id) {
        let dr;
        Model.drafts.findOne({id: req.body.id}).then((draft) => {
          draft.state = req.body.state;
          dr = draft;
          return draft.save();
        }).then((d) => {
          res.send(dr);
        }).catch((err) => {
          console.log('mails drafts Error', err);
        })
      } else {
        let data = {
          account: req.params.accountId,
          state: req.body.state
        };
        Model.drafts.create(data).then((draft) => {
          res.send(draft);
        }).catch((err) => {
          console.log('mails drafts Error', err);
        })
      }
      
    }],
    'get /:accountId/drafts': [function (req, res, next) {
      let query = {account: req.params.accountId}
      Model.drafts.find(query).sort('createdAt DESC').then((drafts) => {
        res.send(drafts);
      }).catch((err) => {
        console.log('mails drafts Error', err);
      })
    }],
    'get /:accountId/drafts/:draftId': [function (req, res, next) {
      let query = {account: req.params.accountId, id: req.params.draftId};

      Model.drafts.findOne(query).then((draft) => {
        res.send(draft);
      }).catch((err) => {
        console.log('mails drafts Error', err);
      })
    }],
    'get /:accountId/search/:content?': [function (req, res, next) {
      console.log('here')
      let query = {account: req.params.accountId, negotiation: null}
      if (req.params.content) {
        query.or = [
          { subject: {'contains': req.params.content} },
          { body: {'contains': req.params.content} },
          { 'from.address': {'contains': req.params.content}},
          { 'from.name': {'contains': req.params.content}},
          { 'to': {'contains': req.params.content}},
          { 'cc': {'contains': req.params.content}},
          { 'bcc': {'contains': req.params.content}},
        ];
      }
      if (req.query.draft) {
        query.draft = true;
      } else {
        query.draft = {$ne: true};
      }

      if (req.query.group) {
        query.groups = {[req.query.group]: true};
      }
      Model.mails.find(query).sort('createdAt DESC').then((mails) => {
        res.send(mails);
      }).catch((err) => {
        console.log('mails Error', err);
      })
    }],
    
    'get /:accountId': [function (req, res, next) {
      let query = {account: req.params.accountId, negotiation: null};
      if (req.query.type) {
        query.type = req.query.type;
      }
      if (req.query.draft) {
        query.draft = true;
      } else {
        query.draft = {$ne: true};
      }
      Model.mails.find(query).sort('createdAt DESC').then((mails) => {
        res.send(mails);
      }).catch((err) => {
        console.log('mails Error', err);
      })
    }],
    'get /:accountId/:emailId': [function (req, res, next) {
      Model.mails.findOne({account: req.params.accountId, id: req.params.emailId}).then((mail) => {
        res.send(mail);
      }).catch((err) => {
        console.log('mails Error', err);
      })
    }],
    'get /:accountId/:emailId/original': [function (req, res, next) {
      Model.mails.findOne({account: req.params.accountId, id: req.params.emailId}).then((mail) => {
        res.send(mail.bodyHTML);
      }).catch((err) => {
        console.log('mails Error', err);
      })
    }],
    
    'delete /:accountId/:mailId': [function (req, res, next) {
      Model.mails.destroy({account: req.params.accountId, id: req.params.mailId}).then((mail) => {
        res.send(mail);
      }).catch((err) => {
        console.log('mails Error', err);
      })
    }],
    'patch /:accountId/:emailId/read': [function(req, res, next) {
      let data;
      let em;
      Model.emails.findOne({account: req.params.accountId, id: req.params.emailId}).then((email) => {
        email.read = true;
        em = email;
        return email.save();
      }).then((email) => {
        res.send(em);
      }).catch((err) => {
        console.log('email Error', err);
      })
    }],
  },
  sockets: {
    self: function (cb) {
    },
  }
};

function saveMails(item, context) {
    return new Promise((resolve, reject) => {
      Service.MailImporter.saveSingleMail(context.account, item).then((mail) => {
        context.sockets.to('account-' + context.account.id).emit('mail-notification', mail);
        console.log('saved', mail)
        context.latest = item.uid;
        resolve(mail);
      }).catch((err) => {
        console.log('super error', err);
        reject(err);
      });
    });
}

function forEachPromise(items, fn, context) {
    return items.reduce(function (promise, item) {
        return promise.then(function () {
            return fn(item, context);
        });
    }, Promise.resolve());
}