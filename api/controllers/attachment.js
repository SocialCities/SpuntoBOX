'use strict';
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
  path: '/attachments',
  actions: {
   
    'get /:accountId/:emailId/:uuid': [function (req, res, next) {
      Model.mails.findOne({account: req.params.accountId, id: req.params.emailId}).then((mail) => {
        if (mail.attachments && mail.attachments.length > 0) {
          mail.attachments.forEach((a) => {
            if (a.uuid === req.params.uuid) {
              res.download(config.upload.path + a.savedFile, a.filename);
            }
          });
        }
      }).catch((err) => {
        console.log('mails Error', err);
      })
    }],
  },
  sockets: {
    self: function (cb) {
    },
  }
};