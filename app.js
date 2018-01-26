var axolot = require('axolot').app;
var areIntlLocalesSupported = require('intl-locales-supported');

var localesMyAppSupports = [
    'it-IT'
];

if (global.Intl) {
    // Determine if the built-in `Intl` has the locale data we need.
    if (!areIntlLocalesSupported(localesMyAppSupports)) {
        // `Intl` exists, but it doesn't have the data we need, so load the
        // polyfill and patch the constructors we need with the polyfill's.
        var IntlPolyfill    = require('intl');
        Intl.NumberFormat   = IntlPolyfill.NumberFormat;
        Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
    }
} else {
    // No `Intl`, so use and load the polyfill.
    global.Intl = require('intl');
}

axolot.on('started', function() {
setInterval(function(){
  let accountRooms = [];
  const rooms = axolot.sockets.nsps['/'].adapter.rooms;
  for (var key in rooms) {
    if (rooms.hasOwnProperty(key) && key.startsWith('account-')) {
      accountRooms.push(key.replace('account-', ''));
    }
  }

  Service.CronEmailFetcherManager.cleanup(accountRooms);
  // console.log(axolot.sockets.nsps['/'].adapter.rooms)
}, 3000);
})
module.exports.app = axolot;
axolot.use(require('skipper')());