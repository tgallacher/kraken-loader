const chaiAsPromised = require('chai-as-promised');
const TestUtils = require('./utils');
const chai = require('chai');

chai.use(chaiAsPromised);
const assert = chai.assert;


describe('main', () => {
  it('it fails if no credentials are supplied', async () => {
    const loader = TestUtils.stubLoader({
      'loader-utils': {
        getOptions: () => undefined
      }
    });

    await TestUtils.runWebpackLoader(loader, (err, output) => {
      assert.instanceOf(err, Error);
      assert.include(err.message, 'secret');
      assert.include(err.message, 'key');
      assert.strictEqual(output, TestUtils.STUBBEDIMAGE);
    });
  });

  it('it accepts credentials via options param', async () => {
    const loader = TestUtils.stubLoader({
      kraken: function Kraken() {
        return {
          upload: (_, cb) => cb({ success: true })
        };
      }
    });

    await TestUtils.runWebpackLoader(loader, (err, output) => {
      assert.isNull(err);
      assert.isNotNull(output);
    });
  });

  it('it can process a file correctly', async () => {
    const loader = TestUtils.stubLoader({
      kraken: function Kraken() {
        return {
          upload: (_, cb) => cb({ success: true })
        };
      }
    });

    await TestUtils.runWebpackLoader(loader, (err, output) => {
      assert.isNull(err);
      assert.instanceOf(output, Buffer);
      assert.notStrictEqual(output, TestUtils.STUBBEDIMAGE);
    });
  });

  it('it accepts credentials from env variables', () => {
    process.env.KRAKEN_LOADER_KEY = 'foo';
    process.env.KRAKEN_LOADER_SECRET = 'bar';

    const loader = TestUtils.stubLoader({
      kraken: function Kraken() {
        return {
          upload: (_, cb) => cb({ success: true })
        };
      },
      'loader-utils': {
        getOptions: () => ({ silent: true }) // don't inject credentials via options
      }
    });

    TestUtils.runWebpackLoader(loader, (err, output) => {
      assert.isNull(err);
      assert.isNotNull(output);
    });

    // clearup
    delete process.env.KRAKEN_LOADER_KEY;
    delete process.env.KRAKEN_LOADER_SECRET;

    assert.isUndefined(process.env.KRAKEN_LOADER_KEY);
    assert.isUndefined(process.env.KRAKEN_LOADER_SECRET);
  });

  it('it handles errors when there is a "fetch" error', () => {
    const message = 'Mock fetch error';
    const loader = TestUtils.stubLoader({
      kraken: function Kraken() {
        return {
          upload: (_, cb) => cb({ success: false, message })
        };
      }
    });

    TestUtils.runWebpackLoader(loader, (err, output) => {
      assert.isNotNull(err);
      assert.strictEqual(err.message, message);
      assert.strictEqual(output, TestUtils.STUBBEDIMAGE);
    });
  });
});
