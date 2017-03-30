var imaps = require('imap-simple');
var addressparser = require('addressparser');
var emailreplyparsertotango = require('emailreplyparsertotango').EmailReplyParserTotango;

const fetchOptions = {
  bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
  struct: true
};

const defaultTimeout = 8000;

class EmailFetcher {
  constructor() {

  }

  fetchEmails(account) {
    let mails = {};
    let connection;
    account.imap.authTimeout = defaultTimeout;
    
    return imaps.connect(account).then((conn) => {
      connection = conn;
      return connection.openBox('INBOX');
    }).then(() => {
      return connection.search(this._prepareSearch(account), fetchOptions);
    }).then((messages) => {
      var attachments = [];
      messages.forEach((message) => {
        if (message.attributes.uid <= account.latestUid) return;

        mails[message.attributes.uid] = this._generateMailData(message);

        attachments = attachments.concat(this._parseMessage(connection, message));
      });

      return Promise.all(attachments);
    }).then((retrievedData) => {
      var result = [];

      mails = this._normalizeMailsObj(mails, retrievedData);

      for (var key in mails) {
        if (mails.hasOwnProperty(key)) {
          result.push(mails[key]);
        }
      }
      
      return new Promise((res, rej) => {
        connection.end();
        return res(result);
      });
    })
  }

  _normalizeMailsObj(mails, retrievedData) {
    retrievedData.forEach((d) => {
      if (d.type === 'attachment') {
        mails[d.uid].attachments.push({filname: d.filename, data: d.data});
      } else if (d.type === 'html') {
        mails[d.uid].bodyHTML = d.text;
      } else if (d.type === 'text') {
        mails[d.uid].fullBody = d.text;
        mails[d.uid].body = d.reply;
      }
    });

    return mails;
  }
  _parseMessage(connection, message) {
    var parts = imaps.getParts(message.attributes.struct);
    return parts.map((part) => {
      if (part.disposition && ( part.disposition.type === 'ATTACHMENT' || part.disposition.type === 'INLINE')) {
          return connection.getPartData(message, part).then(this._prepareAttachment.bind(this, message, part));
      }
      
      if(part.type === 'text') {
          return connection.getPartData(message, part)
          .then(this._prepareText.bind(this, message, part));
      }
    });
  }
  _generateMailData(message) {
    return {
      uid: message.attributes.uid,
      date: message.attributes.date,
      from: addressparser(message.parts[0].body.from[0])[0],
      subject: message.parts[0].body.subject[0],
      attachments: []
    };
  }

  _prepareAttachment(message, part, partData) {
    return {
      type: 'attachment',
      uid: message.attributes.uid,
      filename: part.disposition.params.filename,
      data: partData
    };
  }

  _prepareText(message, part, partData) {
    return {
      type: part.subtype === 'html' ? 'html' : 'text',
      reply: part.subtype === 'plain' ? emailreplyparsertotango.parse_reply(typeof partData === 'object' ? '' : (partData || '')) : null,
      text: partData,
      uid: message.attributes.uid,
    };
  }

  _prepareSearch(account) {
    return [(account.latestUid + 1) +  ':*']; //NOTE: latestUid is the latest one we saved, so we need to start from the next one
  }
};

module.exports = new EmailFetcher();