'use strict';
module.exports = {

  identity: 'checkins',

  attributes: {
    account: { model: 'accounts'},
    status: { type: 'string', required: true, defaultsTo: 'in-hotel' },
    guests: { type: 'array', required: true},
    roomNumber: {type: 'string' },
    plate: {type: 'string'},
    checkinDate: {type: 'datetime'},
    checkoutDate: {type: 'datetime'},
    daysInterview: {type: 'string'},
    email: {type: 'string'},
    interviewSent: {type: 'boolean', defaultsTo: false}
  }
};
