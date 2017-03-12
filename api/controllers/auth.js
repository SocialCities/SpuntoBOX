function loginEmailPassword(req, email, password, cb) {
  req.app.models.users.findOne({ 'email': email }, function (err, user) {
    if (err || !user)
      return cb(err);

    user.validPassword(password, function (err, result) {
      if (err || result === false) return cb({ err: 'Oops! Wrong password.' });
      return cb(null, user);
    });
  });
}

function login(req, cb) {
  var email = req.body.email;
  var password = req.body.password;
  var token = req.body.token;
  if (email && password) {
    loginEmailPassword(req, email, password, cb);
  } else if (token) {
    loginEmailPassword(req, token, cb);
  }
}

module.exports = {
  path: '/',
  actions: {
    'post /login': function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      login(req, function (err, user) {
        if (err || !user) {
          return res.json(500, { message: 'Check your email' });
        }
        var accessToken = Service.token.sign({ id: user.id, scopes: user.scopes });
        return res.json({ accessToken: accessToken, id: user.id, email: user.email, name: user.name });
      });
    },
    'get /me': [checkScopes(['user']),function (req, res, nect) {
      let u;
      Model.users.findOne(req.user).then((user) => {
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
