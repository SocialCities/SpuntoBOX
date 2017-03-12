'use strict';

module.exports = {
  path: '/emails',
  actions: {

    'get /test': [function (req, res, next) {
      //ULTRA TEST
      Model.accounts.findOne('581c6d4a77c87d25021db5de').then((account) => {
        return Service.EmailFetcher.fetchEmails(account).then((res) => {
          res.forEach((m) => {
            console.log(m);
            Service.MailImporter.saveSingleMail(account, m).then((mail) => {
              this.sockets.to('account-' + account.id).emit('mail-notification', mail);
              console.log('saved', mail)
            }).catch((err) => {
              console.log('super error', err);
            })
          });
        });
      }).catch(error => 
      {console.log('mega error', error)});
    }]
  },
  sockets: {
    self: function (cb) {
    },
  }
};
