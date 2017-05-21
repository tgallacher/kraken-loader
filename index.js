/* eslint no-console: off, consistent-return: off */
const chalk = require('chalk');
const fetch = require('node-fetch');
const utils = require('loader-utils');
const Kraken = require('kraken');
const prettyBytes = require('pretty-bytes');

/**
 * Kraken.io API options
 *
 * @type {Object}
 */
let options = {};

/**
 * Default options
 *
 * @type {Object}
 */
const defaults = {
    key: null,
    secret: null,
    lossy: true,
    enabled: true,
    silent: false
};

/**
 * Indicate error state
 * @type {Boolean}
 */
let stateOk = true;


const errMessage = str =>
    `kraken-loader: ${str}`;

const fileSuccessMessage = (filename, str) =>
    `${chalk.green('✔ kraken-loader:')} ${chalk.grey(`'${filename}'`)} - ${str}`;


module.exports = function krakenLoader(content){
    this.cacheable && this.cacheable();

    options = Object.assign({}, defaults, utils.getOptions(this));

    if( ! options.enabled || ! stateOk){
        return content;
    }

    // Try loading API credentials from env. vars
    if( ! options.key || ! options.secret){
        options = Object.assign({}, options, {
            key: process.env.KRAKEN_LOADER_KEY,
            secret: process.env.KRAKEN_LOADER_SECRET
        });
    }

    if( ! options.key || ! options.secret){
        stateOk = false; // prevent duplicate errors
        this.emitError(new Error(errMessage('Missing Kraken API key and secret')));

        return content;
    }

    const kraken = new Kraken({
        api_key: options.key,
        api_secret: options.secret
    });

    const filename = this.resourcePath.replace(this.context, '');
    const callback = this.async();

    kraken.upload({
        file: this.resourcePath,
        lossy: options.lossy,
        wait: true
    }, (data) => {
        ! data.success && callback(new Error(errMessage(data.message)));

        const savings = data.saved_bytes;
        const originalSize = data.original_size;

        const percent = ((savings * 100) / originalSize).toFixed(2);
        const msg = savings > 0
            ? `saved ${prettyBytes(savings)} (${percent}%)`
            : 'already optimized';

        // display savings
        if( ! options.silent){
            console.log(fileSuccessMessage(filename, msg));
        }

        fetch(data.kraked_url)
            .then( resp => resp.buffer() )
            .then( buffer => callback(null, buffer) )
            .catch( err => callback(err) );
    });
};

module.exports.raw = true;
