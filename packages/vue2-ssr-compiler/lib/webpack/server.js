const path = require('path')

const webpack = require('webpack')
const { merge } = require('webpack-merge')
const base = require('./base')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const { targetPath } = require('../path')

module.exports = merge(base, {
  target: 'node',
  entry: `${targetPath}/src/entry-server.js`,
  output: {
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: {
      '@src': path.resolve(targetPath, './src')
    }
  },
  externals: nodeExternals({
    allowlist: [/\.css$/, /vue2-ssr-libs/]
  }),
  plugins: [
    new webpack.DefinePlugin({
      'process.en': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        VUE_ENV: 'server'
      }
    }),
    new VueSSRServerPlugin()
  ]
})
