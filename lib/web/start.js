'use strict';

var log = require('../../getLogger')('start web server');
var fs = require('fs');
var path = require('path');
var buildPage = require('./buildPage');

module.exports = function start(botkit) {
  if(process.env.PORT) {
    botkit.setupWebserver(process.env.PORT, function(err, server) {
      if(err) {
        log.error(err);
        return;
      }

      var apiRoot = '/api';
      log.info('Registering API endpoints at ' + apiRoot);
      server.delete = server.del;
      var apiEndpoints = require('./api');
      for(var endpoint of apiEndpoints) {
        for(var handler of endpoint.handlers) {
          server[handler.verb.toLowerCase()](path.join(apiRoot, endpoint.path), handler.handler);
          log.verbose(' --> ' + handler.verb.toUpperCase() + '\t' + path.join(apiRoot, endpoint.path))
        }
      }

      var indexView = function(req, res) {
        res.send(buildPage());
      };
      server.get('/', indexView);
      server.get('/index.htm', indexView);
      server.get('/index.html', indexView);
    });
  } else {
    log.warn('Web server not started: PORT env variable not set');
  }
}
