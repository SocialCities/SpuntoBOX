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
  } else cb("no data provided")
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
    'patch /me/password': [checkScopes(['user']),function (req, res, nect) {
      if (req.body.new.length < 6) {
        return res.status(500).send({message: 'Password troppo corta'});
      }
      if (req.body.new !== req.body.confirm) {
        return res.status(500).send({message: 'Password diverse'});
      }
      Model.users.findOne(req.user).then((user) => {
        return new Promise((resolve, reject) => {
          console.log(req.body.old)
          user.validPassword(req.body.old, function (err, result) {
            if (err || result === false) {
              return reject(new Error('La vecchia password non corrisponde'));
            }
            Service.crypt.generate({ saltComplexity: 10 }, req.body.new, function (err, hash) {
              if (err) {
                throw new Error('Errore nella creazione della password');
              } else {
                user.password = hash;
                return resolve(user.save());
              }
            });
          });
        });
      }).then((us) => {
        res.send({changed: true});
      }).catch((err) => {
        res.status(500).send({message: err.message});
        console.log
        console.log('users Error', err);
      })
    }],

    'patch /me': [checkScopes(['user']),function (req, res, nect) {
      Model.users.findOne(req.user).then((user) => {
        (req.body.fields || []).forEach(f => {
          console.log(f)
          if (f.field === 'password')
            throw new Error("Non puoi modificare la password");
          else if (f.field === 'email' && !validateEmail(f.value))
            throw new Error("Email non valida");
          if (f.field !== 'email')
            user[f.field] = f.value;
        })
        cust = user;
        console.log('cust', cust)
        return user.save();
      }).then((us) => {
        return Model.accounts.find({select: ['id', 'name', 'email'], where: {id: cust.accounts}})
      }).then((accounts) => {
        cust.accounts = accounts
        res.send(cust);
      }).catch((err) => {
        res.status(500).send({message: err.message});
        console.log
        console.log('users Error', err);
      })
    }],
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

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
}