const proxyquire = require('proxyquire').noPreserveCache();

/**
 * Mock image buffer.
 *  - 600x800 pxls, 4 channels (RGBA)
 *
 * @type {Buffer}
 */
const STUBBEDIMAGE = Buffer.alloc(600 * 800 * 4, 0x00000000);

/**
 *
 * @param {Function} loader - Webpack loader function
 * @param {Function} testCallback - callback to be called when loader has completed/errored.
 *                                  This is where we'll put the assertions.
 */
const runWebpackLoader = (loader, testCallback) => {
  const context = {
    loader,
    resourcePath: '/foo/bar',
    async: () => (err, buffer) => testCallback(err, buffer)
  };

  // run
  context.loader(STUBBEDIMAGE);

  return context;
};

/**
 *
 * @param {Object} proxyModules
 */
const stubLoader = (proxyModules = {}) => {
  const stubs = Object.assign({},
    {
      kraken: function Kraken() {
        return {
          upload: () => undefined // Don't do anything on upload
        };
      },
      'node-fetch': () => Promise.resolve({
        buffer: () => Promise.resolve(Buffer.from(STUBBEDIMAGE))
      }),
      'loader-utils': {
        getOptions: () => ({
          secret: 'foo',
          silent: true,
          key: 'bar'
        })
      }
    },
    proxyModules
  );

  return proxyquire('../index', stubs);
};

exports.STUBBEDIMAGE = STUBBEDIMAGE;
exports.stubLoader = stubLoader;
exports.runWebpackLoader = runWebpackLoader;