const command = require('commander');
const merge = require('merge-deep');
const resolve = require('self-referenced-json').render;
const sshfs = require('../sshfs');

var app = function (config) {
  this.config = config;
};

app.prototype.handle = function (args) {
  let self = this;
  const {defaults, hosts} = this.config;

  command
    .version(require('project-version'))
    .description(
      'A simple command-line tool for mounting sshfs hosts quickly and easily by making use of a config file.'
    )
    .option('-c, --config', 'Print config (optionally for host)')
    .option('-l, --list', 'List all configured hosts')
    .arguments('<host>')
    .action(function (host) {
      if (!hosts.hasOwnProperty(host)) {
        console.error('There are no configured hosts for "%s"', host);
        process.exit(1);
      }

      self.host = host;
    })
    .parse(args);

  if (command.rawArgs.length < 3) {
    // there are no command args
    command.help();
  }

  let options = this.config;
  if (self.hasOwnProperty('host')) {
    options = merge(hosts[self.host], defaults);
    options = JSON.stringify(options, function (key, value) {
      if (key === 'mountpoint' && typeof value === 'string') {
        value = value.replace(/^(\$HOME|~)/, process.env.HOME);
      }
      return value;
    });
    options = resolve(options);
  }

  switch (true) {
    case command.config:
      console.log(options);
      break;
    case command.list:
      Object.keys(hosts).forEach(function (key) {
        console.log(key);
      });
      break;
    default:
      sshfs.mount(options);
  }
};

module.exports = app;
