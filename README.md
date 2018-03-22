kraken-loader
===========

Image optmization loader for Webpack 2+ using [Kraken.io](https://kraken.io).

<!-- MarkdownTOC -->

1. [Installation](#installation)
1. [Options](#options)
1. [Usage](#usage)
1. [Acknowledgements](#acknowledgements)
1. [LICENSE - MIT](#license---mit)

<!-- /MarkdownTOC -->


<a name="installation"></a>
## Installation

````
$ npm i -D kraken-loader
````

<a name="options"></a>
## Options

The loader supports the following options:

* `key` - your Kraken API Key
* `secret` - your Kraken API Secret
* `lossy` - enable/disable intelligent lossy optimization. Defaults to `true`
* `enabled` - enable/disable optimization using this loader. Defaults to `true`
* `silent` - enable/disable byte savings message. Defaults to `false`

The loader also supports supplying your API credentials using the following environment variables:
* `KRAKEN_LOADER_KEY` - Kraken API Key
* `KRAKEN_LOADER_SECRET` - Kraken API Secret

The environment variables offer a way to supply your API credentials without having to commit them to your VCS. This is the recommended method for supplying your Kraken.io API credentials.

<a name="usage"></a>
## Usage

It is expected that this plugin will be used alongside the [url-loader](https://github.com/webpack/url-loader), [file-loader](https://github.com/webpack/file-loader), or [raw-loader](https://github.com/webpack/raw-loader).


### Use with loader defaults
The following example requires your API credentials to be supplied using the supported environment variables (see [Options](#options)).

````js
module.exports = {
    ...
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]'
                        }
                    },
                    'kraken-loader'
                ]
            }
        ],
    }
}
````

### Customising the loader config
```js
module.exports = {
    ...
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]'
                        }
                    },
                    {
                        loader: 'kraken-loader',
                        options: {
                            enabled: process.env.NODE_ENV === 'production',
                            secret: 'my-api-secret',
                            silent: true,
                            lossy: true,
                            key: 'my-api-key'
                        }
                    }
                ]
            }
        ]
    }
}
```

Supplying your API credentials in the options object is optional. The options object can be used alongside the environment variables for specifying API credentials.

<a name="acknowledgements"></a>
## Acknowledgements

This plugin was inspired by the [gulp-kraken](https://github.com/kraken-io/gulp-kraken) plugin.

<a name="license---mit"></a>
## LICENSE - MIT
See [LICENSE](/LICENSE.md) for details.
