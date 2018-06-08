const fs = require('fs');
const express = require('express');
const ejs = require('ejs');
const zlib = require('zlib');
const utils = require('./utils.js');

const app = express();
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

module.exports = {
  serve: function(params, callback) {
    const listen = this.listen;
    const buffer = params.buffer;
    listen({ buffer, params }, callback);
  },

  listen: function(config, onListen) {
    app.get('/', (req, res) => {
      utils.makeStyle(config.buffer).then((style) => {
        return res.render('./index.html', { style: style, params: config.params });
      });
    });

    app.get('/:z(\\d+)/:x(\\d+)/:y(\\d+).mvt', (req, res) => {
      res.set({
        'Content-Type': 'application/vnd.mapbox-vector-tile',
        'Content-Encoding': 'gzip',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
      });

      const z = parseInt(req.params.z);
      const x = parseInt(req.params.x);
      const y = parseInt(req.params.y);

      if (z === 7 && x === 20 && y === 44) {
        return res.send(zlib.gzipSync(config.buffer));
      } else {
        return res.status(404).send("Sorry can't find that!");
      }
    });

    config.server = app.listen(3000, function () {
      onListen(null, config);
    });
  }
}
