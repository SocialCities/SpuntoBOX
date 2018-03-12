'use strict';
var htmlToText = require('html-to-text');
var Mustache = require("mustache")
var path = require("path");
var uuidv4 = require('uuid/v4');
var config = require('axolot/config/config');

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
    'get /image/:id': [function(req, res, next) {
      Model.mails.update({id: req.params.id}, {status: 'green'}).then((st) => {
        res.sendFile(__dirname + '/transparent.png');
      }).catch((err) => {
        console.log('updatedEmail Error', err);
      })

    }],
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
      let custId = false;
      let emailTo = [];
      let emailCc = [];
      let emailBcc = [];
      Model.customers.find({email: emails, account: req.params.accountId}).then((customers) => {
        console.log('CUSTOMERS', customers);
        customers.forEach((c) => {
          if (c.group) groups[c.group] = true;
        });
        
        emailTo = (req.body.to || []).map(e => {
          let em = e;
          customers.forEach(c => {
            if (e === c.email) {
              em = `${c.name} ${c.surname} <${c.email}>`;
            }
          });
          return em;
        });
        emailCc = (req.body.cc || []).map(e => {
          let em = e;
          customers.forEach(c => {
            if (e === c.email) {
              em = `${c.name} ${c.surname} <${c.email}>`;
            }
          });
          return em;
        });

        emailBcc = (req.body.bcc || []).map(e => {
          let em = e;
          customers.forEach(c => {
            if (e === c.email) {
              em = `${c.name} ${c.surname} <${c.email}>`;
            }
          });
          return em;
        });

        console.log('looking for customers')
        emails.forEach(e => {
          console.log('looking for customer: ', e)
          let found = false;
          customers.forEach(c => {
            if (e === c.email) {
              console.log('customer found: ', e);
              custId = c.id;
              found = true;
            }
          });
          if (found === false) {
            console.log('customer not found: ', e)
            addCustomer(e, req.params.accountId);
          }
        });
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
                id: c.id,
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

        let parsedBody = htmlToText.fromString(body);
        let fullBody = parsedBody;
        let toSend = parsedBody;
        let toSendHtml = body;
        if (req.body.oldEmail && req.body.oldEmail.fullBody) {
          toSend += "\n\n" + req.body.oldEmail.fullBody.replace(/^/gm, '\n> ');
          toSendHtml += "<br><br><div class=\"gmail_extra\"><div class=\"gmail_quote\"><blockquote>" + req.body.oldEmail.fullBody.replace(/^/gm, '<br> ') + "</blockquote></div></div>";
        }

        if (req.body.to.length === 1) {
          body = body + '<br /><br /><a href="' + config.webUrl + '/optout/' + custId + '">Disiscriviti dal nostro sistema</a>';
	  toSendHtml = toSendHtml + '<br /><br /><a href="' + config.webUrl + '/optout/' + custId + '">Disiscriviti dal nostro sistema</a>';
        }
        email.account = req.params.accountId;
        email.uuid = uuidv4();
        email.oldId = req.body.oldEmail && req.body.oldEmail.id;
        email.body = parsedBody;
        email.fullBody = fullBody;
        email.bodyHTML = body;
        email.bodyToSend = toSend;
        email.bodyToSendHtml = toSendHtml;
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
        let emailToSend = JSON.parse(JSON.stringify(email));
        emailToSend.to = emailTo;
        emailToSend.cc = emailCc;
        emailToSend.bcc = emailBcc;
        return Service.Mail.sendEmail(emailToSend, account.smtp);
      }).then((receipt) => {
        if (req.body.oldEmail && req.body.oldEmail.id) {
          Model.mails.update({account: req.params.accountId, id: req.body.oldEmail.id}, {status: 'orange'}).then((st) => {
            console.log('updatedEmail', st)
          }).catch((err) => {
            console.log('updatedEmail Error', err);
          })
        }
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
    'get /:accountId/search/?': [function (req, res, next) {
      console.log('here')
      let query = {account: req.params.accountId, negotiation: null}
      if (req.query.content) {
        query.or = [
          { subject: {'contains': req.query.content} },
          { body: {'contains': req.query.content} },
          { 'from.address': {'contains': req.query.content}},
          { 'from.name': {'contains': req.query.content}},
          { 'to': {'contains': req.query.content}},
          { 'cc': {'contains': req.query.content}},
          { 'bcc': {'contains': req.query.content}},
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
      if (req.query.from || req.query.to) {
        let date = {date: {}};
        let createdAt = {createdAt:{}};
        if (req.query.from) {
          date.date['>='] = new Date(parseInt(req.query.from));
          createdAt.createdAt['>='] = new Date(parseInt(req.query.from));
        }
        if (req.query.to) {
          date.date['<='] = new Date(parseInt(req.query.to));
          createdAt.createdAt['<='] = new Date(parseInt(req.query.to));
        }
        if (!query.or) {
          query.or = [];
        }
        query.or.push(date)
        query.or.push(createdAt)
      
      }

      if (req.query.folder && req.query.folder !== 'draft') {
        query['folders.id'] = req.query.folder;
      }
      
      console.log('q', query)
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
    'patch /:accountId/:emailId/folder': [function(req, res, next) {
      let data;
      let em;
      Model.mails.findOne({account: req.params.accountId, id: req.params.emailId}).then((email) => {
        console.log(email);
        console.log('email^^')
        if (!email.folders) {
          email.folders = [];
        } 
        email.folders.push(req.body);
        em = email;
        return email.save();
      }).then((email) => {
        res.send(em);
      }).catch((err) => {
        console.log('email Error', err);
      })
    }],

    'patch /:accountId/:emailId/read': [function(req, res, next) {
      let data;
      let em;
      Model.mails.findOne({account: req.params.accountId, id: req.params.emailId}).then((email) => {
        console.log(email);
        console.log('email^^')
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
