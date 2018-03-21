/* eslint no-console: off, consistent-return: off */
const chalk = require('chalk');
const fetch = require('node-fetch');
const utils = require('loader-utils');
const Kraken = require('kraken');
const prettyBytes = require('pretty-bytes');

/**
 * Default options
 *
 * @type {Object}
 */
const defaults = {
  enabled: true,
  secret: null,
  silent: false,
  lossy: true,
  key: null
};

/**
 * Kraken.io API options
 *
 * @type {Object}
 */
let options = {};

/**
 * Indicate error state
 *
 * @type {Boolean}
 */
let stateOk = true;

/**
 * Print a message to stdout
 *
 * @param {String} str - Message string to print to stdout
 * @param {Boolean} isError - Is the message an error message - will adjust formatting?
 */
const printMessage = (str, isError = false) => isError
  ? `${chalk.red('✔ kraken-loader:')} ${chalk.grey(`'${str}'`)}`
  : `${chalk.green('✔ kraken-loader:')} ${chalk.grey(`'${str}'`)}`;

/**
 * Main loader function.
 *
 * @param {Buffer} source
 */
const krakenLoader = function (source) {
  const callback = this.async();

  if (this.cacheable) {
    this.cacheable();
  }

  options = Object.assign(
    {},
    defaults,
    utils.getOptions(this)
  );

  if ( ! options.enabled || ! stateOk) {
    return callback(null, source);
  }

  // Try loading API credentials from env. vars
  if ( ! options.key || ! options.secret) {
    options = Object.assign({}, options, {
      key: process.env.KRAKEN_LOADER_KEY,
      secret: process.env.KRAKEN_LOADER_SECRET
    });
  }

  if ( ! options.key || ! options.secret) {
    stateOk = false; // prevent duplicate errors

    return callback(new Error('Missing Kraken API key and secret'), source);
  }

  const filename = this.resourcePath.replace(this.context, '');

  const kraken = new Kraken({
    api_secret: options.secret,
    api_key: options.key
  });

  // Process file
  kraken.upload({
    lossy: options.lossy,
    file: this.resourcePath,
    wait: true
  }, async (data) => {
    if ( ! data.success) {
      const err = new Error(data.message || 'Unknown Kraken API error. Please try again.');

      return callback(err, source);
    }

    // display savings
    if ( ! options.silent) {
      const savings = data.saved_bytes;
      const origSize = data.original_size;
      const percent = ((savings / origSize) * 100).toFixed(2);

      const msg = savings > 0
        ? `saved ${prettyBytes(savings)} (${percent}%)`
        : 'already optimized';

      console.log(printMessage(`${filename} - ${msg}`));
    }

    //
    // Get the optimised file + pass onwards
    //

    try {
      const resp = await fetch(data.kraked_url);
      const buffer = await resp.buffer();

      return callback(null, buffer);
    } catch (err) {
      return callback(err, source);
    }
  });

  // return callback(new Error('Unknown error'));
};

module.exports = krakenLoader;
module.exports.raw = true;  // Ensure the image isn't UTF-8 encoded; instead receive the raw buffer
