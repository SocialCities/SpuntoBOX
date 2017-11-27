var nodemailer = require('nodemailer');
var htmlToText = require('nodemailer-html-to-text').htmlToText;
var mainConfig = require('axolot/config/config');
var path = require('path');

module.exports = {
    getTransportConfig: function(config) {
        let cfg = {
            auth: {
                user: config.user,
                pass: config.password
            }
        };
        if (config.service && config.service != 'smtp') {
            cfg.service = config.service;
        } else {
            cfg.host = config.host;
            cfg.port = config.port;
            cfg.secure = false; //config.tls;
        }

        return cfg;
    },
    sendEmail: function (email, config) {
    var transporter = nodemailer.createTransport(this.getTransportConfig(config));

    transporter.use('compile', htmlToText());
    console.log('email', email)
    return new Promise((res, rej) => {
      transporter.sendMail({
        from: email.from,
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        text: email.bodyToSend,
        html: email.bodyToSendHtml || email.bodyHTML || email.body,
        subject: email.subject,
        headers: {"Content-Transfer-Encoding": "quoted-printable"},
        attachments: (email.attachments || []).map(a => {
            return {   // file on disk as an attachment
                filename: a.filename,
                path: path.join(mainConfig.upload.path, a.savedFile) // stream this file
            };
        }),
        emcoding: 'quoted-printable'
      }, (value, err) => {
          console.log(value)
          console.log(err)
        if (err && !err.messageId) return rej(err);

        return res(err);
      });
    });
  },
    /**
     * Sends an email to a given recipient
     * @method send
     * @param {object}   email           an object containing all of the necessary data to email
     * @param {Function} cb[err, res]    the callback to call once email is sent, or if it fails
     * @return
     */
    send: function (email, cb) {
        var config = this.config;
        /** sets up the modemailer smtp transport */
        var transport = nodemailer.createTransport(config.nodemailer.type, {
            service: config.nodemailer.service,
            auth: {
                user: config.nodemailer.user,
                pass: config.nodemailer.pass
            }
        });

        /** sets up the mail options, from and such like that **/
        var from = email.from || 'nobody@nobody.com';
        var subject;
        if (config.nodemailer.prependSubject) {
            subject = config.nodemailer.prependSubject + email.subject;
        } else {
            subject = email.subject;
        }

        var mailOptions = {
            from: email.name + '<' + from + '>',
            to: email.to,
            subject: subject,
            html: email.messageHtml
        };

        /** Actually sends the email */
        transport.sendMail(mailOptions, function (err, response) {
            if (err) return cb(err);
            return cb(null, response);
        });
    }
};