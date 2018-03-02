'use strict';

module.exports = {
  path: '/sidebars',
  actions: {
    'get /customer/:account/:customer': [function(req, res, next) {
      let response = {};
      Model.customers.findOne({id: req.params.customer, account: req.params.account}).then(c => {
        response.customer = c;

        return Model.mails.find({client: c.id, account: req.params.account, negotiation: null}).sort('createdAt DESC').limit(3);
      }).then(emails => {
        response.emails = emails.map(e => {
          return {
            id: e.id,
            title: e.subject,
            text: e.body,
            date: e.date
          }
        });
      
        return Model.mails.count({to: response.customer.email, account: req.params.account, negotiation: null});
      }).then(emailCount => {
        response.sentEmails = emailCount;

        return Model.mails.count({client: response.customer.id, account: req.params.account, negotiation: null});
      }).then(emailCount => {
        response.receivedEmails = emailCount;

        return Model.negotiations.find({client: req.params.customer, account: req.params.account}).sort('updatedAt DESC');
      }).then(negotiations => {
        response.negotiations = {
          active: false,
          closed: 0,
          history: [],
          current: false
        };
        negotiations.forEach(n => {
          if (n.status === 'pending'){
            response.negotiations.current = n;
            response.negotiations.active = true;
          } else {
            if (n.type === 'checkin') {
              response.negotiations.history.push({
                date: n.updatedAt,
                esito: 'Positivo'
              });
            } else {
              response.negotiations.history.push({
                date: n.updatedAt,
                esito: 'Negativo'
              });
            }
            response.negotiations.closed += 1;
          }

        });

        return Model.interviewscustomers.find({customer: req.params.customer, account: req.params.account});
      }).then(ics => {
        response.interviews = {
          answers: ics.length || 0,
          average: 0
        }
        let totalAnswers = 0;
        let sumAnswers = 0;
        ics.forEach(ics => {
          ics.questions.forEach(q => {
            totalAnswers += 1;
            sumAnswers += parseInt(q.vote || 0);
          });
        });

        response.interviews.average = totalAnswers > 0 ? (sumAnswers / totalAnswers).toFixed(1) : 0;

        res.send(response);
      }).catch(e => {
        console.log('sidebar customer error: ', e);
        res.status(500).send(e);
      })
    }],
    'get /interview-votes/:account/:interview?': [function(req, res, next) {
      let response = {};
      let query = {account: req.params.account};
      if (req.params.interview) {
        query.interview = req.params.interview; 
      }
      
      Model.interviewscustomers.find(query).sort('createdAt DESC').then(ics => {
        response = {
          answers: ics.length || 0,
          average: 0,
          questions: {}
        }
        let questions = {};
        let totalAnswers = 0;
        let sumAnswers = 0;
        ics.forEach(ics => {
          ics.questions.forEach(q => {
            if (!questions[q.category]) {
              questions[q.category] = {
                answers: 0,
                sumAnswers: 0
              };
            }
            questions[q.category].answers += 1;
            questions[q.category].sumAnswers += parseInt(q.vote || 0);

            totalAnswers += 1;
            sumAnswers += parseInt(q.vote || 0);
          });
        });
        response.questions = questions;
        response.average = totalAnswers > 0 ? (sumAnswers / totalAnswers).toFixed(1) : 0;

        res.send(response);
      }).catch(e => {
        console.log('sidebar customer error: ', e);
        res.status(500).send(e);
      })
    }],
    'get /interview-votes-customer/:account/:customer': [function(req, res, next) {
      let response = {};
      let query = {customer: req.params.customer, account: req.params.account};

      Model.interviewscustomers.find(query).sort('createdAt DESC').then(ics => {
        response = {
          answers: ics.length || 0,
          average: 0,
          questions: {},
          history: [],
          latest: ics.length > 0 ? ics[0].createdAt : false
        }
        
        let questions = {};
        let totalAnswers = 0;
        let sumAnswers = 0;
        let history = [];
        let cTotalAnswers = 0;
        let cSumAnswers = 0;
        ics.forEach(ics => {
          cTotalAnswers = 0;
          cSumAnswers = 0;
          ics.questions.forEach(q => {
            if (!questions[q.category]) {
              questions[q.category] = {
                answers: 0,
                sumAnswers: 0
              };
            }
            questions[q.category].answers += 1;
            questions[q.category].sumAnswers += parseInt(q.vote || 0);

            totalAnswers += 1;
            sumAnswers += parseInt(q.vote || 0);
            cTotalAnswers += 1;
            cSumAnswers += parseInt(q.vote || 0);
          });

          history.push({average: cTotalAnswers > 0 ? (cSumAnswers / cTotalAnswers).toFixed(1) : 0, date: ics.createdAt});
        });
        response.questions = questions;
        response.average = totalAnswers > 0 ? (sumAnswers / totalAnswers).toFixed(1) : 0;
        response.history = history;

        res.send(response);
      }).catch(e => {
        console.log('sidebar customer error: ', e);
        res.status(500).send(e);
      })
    }]
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
