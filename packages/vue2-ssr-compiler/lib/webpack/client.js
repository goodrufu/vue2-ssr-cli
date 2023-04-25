const path = require('path')

const webpack = require('webpack')
const { merge } = require('webpack-merge')
const base = require('./base')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const { targetPath } = require('../path')

const config = merge(base, {
  target: 'web',
  entry: `${targetPath}/src/entry-client.js`,
  resolve: {
    alias: {
      '@src': path.resolve(targetPath, './src')
    }
  },
  optimization: {
    runtimeChunk: 'single'
  },
  plugins: [
    // strip dev-only code in Vue source
    new webpack.DefinePlugin({
      'process.en': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        VUE_ENV: 'client'
      }
    }),
    new VueSSRClientPlugin()
  ]
})

module.exports = config
