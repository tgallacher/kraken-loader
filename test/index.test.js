const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noPreserveCache();

// const compiler = require('./compiler');

chai.use(chaiAsPromised);
const assert = chai.assert;

const stubbedImage = Buffer.alloc(600 * 800 * 4, 0x00000000); // 600x800 pxls, 4 channels (RGBA)

/**
 *
 * @param {Function} loader - Webpack loader function
 * @param {Function} callback - callback to be called when loader has completed. This should contain the assertions.
 */
const runWebpackLoader = (loader, callback) => {
  const context = {
    loader,
    resourcePath: '',
    async: () => (err, buffer) => callback(err, buffer)
  };

  context.loader(stubbedImage);

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
      }
    },
    proxyModules
  );

  return proxyquire('../index', stubs);
};


describe('main', () => {
  it('it fails if no credentials are supplied', async () => {
    const loader = stubLoader();

    await runWebpackLoader(loader, (err, output) => {
      assert.instanceOf(err, Error);
      assert.include(err.message, 'secret');
      assert.include(err.message, 'key');
      assert.strictEqual(output, stubbedImage);
    });
  });

  it('it accepts credentials via options param', async () => {
    const loader = stubLoader({
      'loader-utils': {
        getOptions: () => ({
          secret: 'foo',
          key: 'bar'
        })
      }
    });

    await runWebpackLoader(loader, (err, output) => {
      assert.isNull(err);
      assert.isNotNull(output);
    });
  });

  it('it accepts credentials from env variables', () => {
    throw new Error('Not yet inplemented');
  });

  it('it can process a file correctly', async () => {
    const loader = stubLoader({
      'loader-utils': {
        getOptions: () => ({
          secret: 'foo',
          key: 'bar'
        })
      }
    });

    await runWebpackLoader(loader, (err, output) => {
      assert.isNull(err);
      assert.notStrictEqual(output, stubbedImage);
    });
  });

  it('it handles errors when there is a "fetch" error', () => {
    throw new Error('Not yet inplemented');
  });

});
