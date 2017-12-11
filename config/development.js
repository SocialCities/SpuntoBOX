// Development environment

// Application configuration
var rootPath = require('path').normalize(__dirname + '/..');

exports.app = {
    root: rootPath,
    name: 'api',
    port: process.env.PORT || 4000
};

// Secrets
exports.secrets = {
    token: 'NOTSOSECRET'
};

exports.webUrl = 'http://localhost:3000';
exports.apiUrl = 'http://localhost:4000';

exports.upload = {
    path: rootPath + '/.tmp/'
}
// Waterline ORM configuration
var mongoAdapter = require('sails-mongo');

exports.orm = {
    adapters: {
        'mongo': mongoAdapter
    },
    connections: {
        'default': {
            adapter: 'mongo',
            host: 'localhost',
            database: 'crm'
        }
    },
    defaults: {
        migrate: 'safe'
    }
};