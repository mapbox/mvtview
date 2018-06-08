#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const open = require('open');
const argv = require('minimist')(process.argv.slice(2));
const utils = require('./utils.js');
const TileView = require('./mvtview.js');

const params = {
  accessToken: process.env.MapboxAccessToken
};

if (!argv._[0]) {
  console.log('No tile provided.');
  console.log(utils.usage);
  process.exit(1);
}
params.buffer = fs.readFileSync(path.resolve(argv._[0]));

TileView.serve(params, (err, config) => {
  console.log('Listening on http://localhost:3000');
  open('http://localhost:3000');
});
