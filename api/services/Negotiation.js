var htmlToText = require('html-to-text');
var dateformat = require('dateformat');

class Negotiation {
  constructor() {

  }

  generateEmail(negotiation) {
    return negotiation.header + this.generateProposals(negotiation.proposals) + negotiation.footer;
  }

  generateProposals(proposals) {
    let txt =[];
    proposals.forEach((p, i) => {
      txt.push('<h4>Proposta ' + (i + 1) + '</h4>');
      txt.push('Data Arrivo: ' + dateformat(new Date(p.arrivalDate), 'd.mm.yyyy'));
      txt.push('Data Partenza: ' + dateformat(new Date(p.departureDate), 'd.mm.yyyy'));
      txt.push('Importo: ' + new Intl.NumberFormat('it-IT', { style: 'currency', currency: p.currency || 'EUR' }).format(p.amount));
      txt.push('Trattamento: ' + p.treatment);
      txt.push('Tipologia: ' + p.type);
      txt.push('Adulti: ' + p.adults);
      if (p.babies) {
        txt.push('Bambini: ' + p.babies + ' (' + p.babiesAge.join(', ') + ')');
      }
      txt.push('')
    })

    return txt.join('<br>');
  }
}

module.exports = new Negotiation();