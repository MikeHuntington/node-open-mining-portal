var redis = require('redis');
var async = require('async');

var stats = require('./stats.js');

module.exports = function(logger, portalConfig, poolConfigs, inactivePools){


    var _this = this;

    var portalStats = this.stats = new stats(logger, portalConfig, poolConfigs, inactivePools);

    this.liveStatConnections = {};

    this.handleApiRequest = function(req, res, next){
        switch(req.params.method){
            case 'stats':
                res.end(portalStats.statsString);
                return;
            case 'live_stats':
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                });
                res.write('\n');
                var uid = Math.random().toString();
                _this.liveStatConnections[uid] = res;
                req.on("close", function() {
                    delete _this.liveStatConnections[uid];
                });

                return;
            default:
                next();
        }
    };

};