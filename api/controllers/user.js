
module.exports = {
  path: '/users',
  actions: {
    'get /': [checkScopes(['admin']),function (req, res, nect) {
      let u;
      Model.users.find().then((users) => {
        res.send(users);
      })
      .catch((err) => {
        console.log(err);

      })
    }],
    'get /:userId': [checkScopes(['admin']),function (req, res, nect) {
      let u;
      Model.users.findOne(req.params.userId).then((user) => {
        u = user;
        return Model.accounts.find({select: ['id', 'name', 'email'], where: {id: user.accounts}})
      }).then((accounts) => {
        u.accounts = accounts
        res.send(u);
      })
      .catch((err) => {
        console.log(err);

      })
    }]
  }
};
