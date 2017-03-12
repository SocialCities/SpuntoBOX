'use strict';

module.exports = {
  path: '/notifications',
  actions: {
  },

  sockets: {
    joinAccount: function (accountId, cb) {
      if (this.socket.user) {
        Model.users.findOneById(this.socket.user.id).then((user) => {
          if (user) {
            if (user.accounts.indexOf(accountId) !== -1) {
              this.socket.join('account-' + accountId);
              console.log('joined')
            }
            
          }
        }).catch((a) => {
          console.log('error', a)
        }) 
      }
    },
  }
};
