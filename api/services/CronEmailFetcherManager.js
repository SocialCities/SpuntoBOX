var cron = require('cron');

class CronEmailFetcherManager {
  constructor() {
    this.crons = {};
  }

  createCronjob(accountId) {
    if (this.crons[accountId]) {
      console.warn('Tried to start a cron but it was already started for this account');
      return;
    }

    this.crons[accountId] = new cron.CronJob({
      cronTime: '*/1 * * * *',
      onTick: () => {
        this.callEmailFetcher(accountId);
      },
      start: true
    });
    console.log('dio mio')
    //console.log(SocketIO.to('account-'+ accountId).emit('asd', 'lol', 'test'));
    this.callEmailFetcher(accountId);
    console.log('dio mio 2')
  }

  callEmailFetcher(accountId) {
    let account;
    let context;
    Model.accounts.findOne(accountId).then((acc) => {
      if (!acc) {
        console.warn('Account not found', accountId);
        throw new Error('Account not found', accountId);
      }

      account = acc;
      return Service.EmailFetcher.fetchEmails(account);
    }).then((result) => {
      context = {sockets: SocketIO, account: account, latest: -1};
      
      return forEachPromise(result, saveMails, context);
    }).then(() => {
      console.log('done');
      console.log('fuckingLatest', context.latest);
      const latest = parseInt(context.latest);
      if (!account.latestUid || account.latestUid < latest) {
        account.latestUid = latest;
      }
      console.log(account);
      return account.save();
    }).then((account) => {
      console.log('saved account', account)

    }).catch((error) => {
      console.log('mega error', error)
    });
  }

  stopCronjob(accountId) {
    this.crons[accountId].stop();
    delete this.crons[accountId];
  }

  cleanup(accounts) {
    let all = [];
    let found = {};
    accounts.forEach((accountId) => {
      if (this.crons[accountId]) found[accountId] = true;
    });
    for (var key in this.crons) {
      if (this.crons.hasOwnProperty(key) && !found[key]) {
        all.push(key);
      }
    }
    all.forEach((accountId) => {
      this.stopCronjob(accountId);
    });
  }
}

module.exports = new CronEmailFetcherManager();


function saveMails(item, context) {
    return new Promise((resolve, reject) => {
      Service.MailImporter.saveSingleMail(context.account, item).then((mail) => {
        context.sockets.to('account-' + context.account.id).emit('mail-notification', mail);
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