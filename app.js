var axolot = require('axolot').app;

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