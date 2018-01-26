'use strict';

module.exports = {
  path: '/accounts',
  actions: {
    'get /:account': [function(req, res, next) {
      Model.accounts.findOne({id: req.params.account}).then((account) => {
        res.send(account);
      }).catch((err) => {
        res.status(500).send(err)
        console.log('customers Error', err);
      })
    }],
    'patch /:account/:sub?': [checkScopes(['user']),function(req, res, next) {
      let acc, u;
      Model.accounts.findOne({id: req.params.account}).then((account) => {
        (req.body.fields || []).forEach(f => {
          if (req.params.sub) {
            if (!account[req.params.sub]) {
              account[req.params.sub] = {};
            }
            account[req.params.sub][f.field] = f.value;
          } else {
            account[f.field] = f.value;
          }
        });
        acc = account;
        console.log('eee', account)
        return account.save();
      }).then(accou => {
        return Model.users.findOne(req.user);
      }).then((user) => {
        u = user;
          return Model.accounts.find({select: ['id', 'name', 'email'], where: {id: user.accounts}})
        }).then((accounts) => {
          u.accounts = accounts
          res.send({user: u, account: acc});
      }).catch((err) => {
        res.status(500).send(err)
        console.log('customers Error', err);
      })
    }],

  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
