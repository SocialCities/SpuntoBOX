var axolot = require('axolot').app;

axolot.on('started', function() {
// setInterval(function(){ console.log(axolot.sockets.nsps['/'].adapter.rooms) }, 3000);
})
module.exports.app = axolot;