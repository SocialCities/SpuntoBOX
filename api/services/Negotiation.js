var htmlToText = require('html-to-text');


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
      txt.push('Data Arrivo: ' + p.arrivalDate);
      txt.push('Data Partenza: ' + p.departureDate);
      txt.push('Importo: ' + p.amount);
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