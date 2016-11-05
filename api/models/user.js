'use strict';
module.exports = {

  identity: 'users',

  attributes: {
    email: { type: 'email', required: true, unique: true },
    name: { type: 'string', required: true },
    password: { type: 'string', required: true },
    activated: 'boolean',
    activationToken: 'string',
    token: 'string',
    accounts: { type: 'array'},
    
    validPassword: function (password, cb) {
      Service.crypt.compare(password, this.password, function (error, response) {
        if (error) return cb(error, response);
        return cb(null, response);
      });
    },

    // Override to filter out sensitive information such as passwords.
    toJSON: function () {
      var obj = this.toObject();
      delete obj.password;
      delete obj.activationToken;
      delete obj.token;
      return obj;
    }
  },

  /**
   * Hash the users password with bcrypt
   * @method beforeCreate
   * @param {object}   user            the object of the submitted user data
   * @param {Function} cb[err, user]   the callback to be used when bcrypts done
   * @return
   */
  beforeCreate: function (user, cb) {
    user.activated = false;
    user.activationToken = Service.crypt.token(new Date().getTime() + user.email);
    user.token = Service.crypt.token(new Date().getTime() + user.email + new Date().getTime());
    if (user.password) {
      Service.crypt.generate({ saltComplexity: 10 }, user.password, function (err, hash) {
        if (err) {
          return cb(err);
        } else {
          user.password = hash;
          return cb(null, user);
        }
      });
    } else {
      cb(null, user);
    }

  }

};
