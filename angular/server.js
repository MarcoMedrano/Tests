var express = require('express');
var path = require('path');

app = express();
port = process.env.PORT || 4000;

app.use(express.static(__dirname + '/client'));
app.use(express.static(path.join(__dirname, '/node_modules')));

app.listen(port);