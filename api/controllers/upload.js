'use strict';
var uuid4 = require('uuid/v4');
var fs = require('fs');
var path = require('path');
var config = require('axolot/config/config');

module.exports = {
  path: '/uploads',
  actions: {
    'post /:account': [function(req, res, next) {
      console.log('files')
      console.log(req.file('file')._files[0].stream)
      console.log(req.file('file')._files[0].stream.filename)
      console.log(req.file('file')._files[0].stream.byteCount)
      req.file('file').upload({
        dirname: config.upload.path
      }, function (err, uploadedFiles) {
        if (err) return res.send(500, err);
        let file = uploadedFiles[0];
        return res.json({
          file: path.basename(file.fd),
          filename: file.filename,
          size: file.size,
          type: file.type
        });
      });
    }]
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
