var http = require('http');
var fs = require('fs');

var port = process.env.port || 1337;

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(port, function () {
    console.log('Server running on '+port+'...');
});