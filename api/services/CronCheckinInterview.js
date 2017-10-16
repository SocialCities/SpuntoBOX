var cron = require('cron');
var Mustache = require("mustache")
var config = require('axolot/config/config');

class CronCheckinInterview {
  constructor() {
    console.log('starting croncheckin')
    new cron.CronJob({
      cronTime: '*/1 * * * *',
      onTick: () => {
        this.prepareInterview();
      },
      start: true
    });
    this.prepareInterview();
  }

  prepareInterview() {
    console.log('checkin')
    const now = new Date();
    let interviews = []
    Model.checkins.find({checkoutDate: {'<': now}, interviewSent: {'!': true}}).then((checkins) => {
      checkins.forEach(c => {
        c.checkoutDate.setDate(c.checkoutDate.getDate() + parseInt(c.daysInterview || 0));
         if (now > c.checkoutDate) {
          interviews.push(() => this.sendInterview(c));
         }
      });

      promiseSerial(interviews)
        .then(console.log.bind(console))
        .catch(console.error.bind(console))
      console.log('find')
    }).catch(e => {
      console.log('error', e);
    });
  }

  sendInterview(checkin) {
    return Promise.all([Model.accounts.findOne({id: checkin.account}), Model.customers.findOne({id: checkin.guests[0].id || 0}), Model.interviews.findOne({account: checkin.account})]).then(results => {
      if (!results[0]) {
        console.log('Something  went  wrong, checkin id:', checkin.id);
        return 'Not Found';
      }
      console.log('content', checkin.email)
      let content = this.getEmail(checkin, checkin.email, results[1] || checkin.guests[0], results[2]);
      let email = {
        from: results[0].email,
        to: checkin.guests[0].email,
        subject: 'Intervista hotel',
        bodyHTML: content
      };

      return Service.Mail.sendEmail(email, results[0].smtp);
    }).then(email => {
      checkin.interviewSent = true;
      checkin.debug = email;

      return checkin.save();
    });

  }

  getEmail(checkin, content, customer, interview) {
    let cust = {
      nome: customer.name,
      cognome: customer.surname
    };

    return Mustache.render(content, {cliente: cust, checkin: checkin, intervista: {link: config.webUrl + '/i/' + interview.id + '/' + customer.id + '/it'}});
  }
  
  
}

module.exports = new CronCheckinInterview();

function forEachPromise(items, fn, context) {
    return items.reduce(function (promise, item) {
        return promise.then(function () {
            return fn(item, context);
        });
    }, Promise.resolve());
}

const promiseSerial = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([]))