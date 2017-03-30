'use strict';

module.exports = {
  path: '/emails',
  actions: {

    'get /test': [function (req, res, next) {
      //ULTRA TEST
      Model.accounts.findOne('581c6d4a77c87d25021db5de').then((account) => {
        return Service.EmailFetcher.fetchEmails(account).then((result) => {
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
    }]
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