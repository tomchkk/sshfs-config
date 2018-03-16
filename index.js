#!/usr/bin/env node
const fs = require('fs');
const path = process.env.HOME + '/.config/sshfs-config/config.json';

if (!fs.existsSync(path)) {
  console.error('No config file could be found at "%s"', path);
  process.exit(1);
}

const config = require(path);
const App = require('./lib/app');

let app = new App(config);
module.exports = app.handle(process.argv);
