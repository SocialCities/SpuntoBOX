var htmlToText = require('html-to-text');

class MailImporter {
  constructor() {

  }

  saveSingleMail(account, mail) {
    return Model.negotiations.findOne({ where: {email: mail.from.address, status: 'pending', account: account.id}}).then((negotiation) => {
      // if (!negotiation) {
      //   return this.createNewNegotiation(account, mail);
      // }

      return this.saveMail(account, mail, negotiation);
    }).catch((err) => {
      console.log('MAIL', mail)
      console.log('mega mega error', err);
    });
  }

  createNewNegotiation(account, mail) {
    return Model.clients.findOne({email: mail.from.address}).then((client) => {
      let negotiation = {
        account: account.id,
        status: 'pending',
        email: mail.from.address,
        name: mail.from.name
      }

      if (client) {
        negotiation.client = client.id;
      }

      return Model.negotiations.create(negotiation);
    }).then((negotiation) => {
      console.log('negotiation', negotiation)
      if (negotiation) {
        return this.saveMail(account, mail, negotiation)
      }
    });
  }

  saveMail(account, mail, negotiation) {

    mail.account = account.id;
    if (negotiation) {
      mail.negotiation = negotiation.id;
    }
    if (!mail.body || mail.body.length === 0) {
      mail.body = htmlToText.fromString(mail.bodyHTML);
    }
    mail.type = 'received';
    
    return Model.mails.create(mail);
  }
}

module.exports = new MailImporter();