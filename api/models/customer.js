'use strict';
module.exports = {

  identity: 'customers',

  attributes: {
    email: { type: 'email', required: true, unique: true },
    name: { type: 'string' },
    surname: { type: 'string' },
    language: { type: 'string', defaultsTo: 'IT' },
    address: { type: 'string' },
    city: { type: 'string' },
    country: { type: 'string' },
    birthday: { type: 'string' },
    documentType: { type: 'string' },
    documentNumber: { type: 'string' },
    documentExpiry: { type: 'string' },
    businessName: { type: 'string' },
    partitaIva: { type: 'string' },
    codiceFiscale: {type: 'string' },
    phone: { type: 'string' },
    fax: { type: 'string' },
    mobilePhone: { type: 'string' },
    mobilePhoneExtra: { type: 'string' },
    negotiations: { type: 'array', defaultsTo:[]},
    latestCheckin: { type: 'datetime' },
    optin: {type: 'boolean', defaultsTo: true}
  }

};
