const exec = require('child_process').exec;
const fs = require('fs');
const schema = require('./options.schema.json');
const Validate = require('validate-arguments');

var sshfs = module.exports = {};

/**
 * Tries to mount an sshfs volume using the given hostOptions
 *
 * @param  {Object} hostOptions
 */
sshfs.mount = function (hostOptions) {
  let args = Validate.named(hostOptions, schema);
  if (!args.isValid()) {
    throw args.errorString();
  }

  const {mountpoint} = hostOptions;

  if (!fs.existsSync(mountpoint)) {
    exec('mkdir -p ' + mountpoint, function (error) {
      if (error !== null) {
        console.error(
          'There was an error creating mountpoint "%s"', mountpoint
        );
        console.error(error);
        process.exit(1);
      }
    });
  }

  let statement = buildStatement(hostOptions);

  exec(statement, function (error, stdout) {
    if (error !== null) {
      console.log('exec error: ', error);
    }
  });
};

/**
 * Builds the sshfs statement from the given arguments.
 *
 * @param  {String} user          The host user name
 * @param  {String} host          The host url
 * @param  {String} target        The host target directory
 * @param  {String} mountpoint    The client mountpoint
 * @param  {Object} options       General options
 * @param  {Object} flags         Flag options
 *
 * @return {String}
 */
function buildStatement ({user, host, target, mountpoint, options = {}, flags = {}}) {
  options = Object.keys(options).map(function (key) {
    return Array.isArray(options[key])
      ? options[key].join(',')
      : `${key}=${options[key]}`;
  }).join(',').replace(/.+/, '-o $&');

  flags = Object.keys(flags).map(function (key) {
    return flags[key] === null
      ? key
      : `${key}=${flags[key]}`;
  }).join(' ');

  return `sshfs ${user}@${host}:${target} ${mountpoint} ${options} ${flags}`;
}
