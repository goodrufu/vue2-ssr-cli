const path = require('path')

const TerserPlugin = require("terser-webpack-plugin")

const { resolve, targetPath } = require('../path')

module.exports = {
  target: 'node',
  mode: 'production',
  entry: resolve('../../template/server.js', __dirname),
  output: {
    hashFunction: 'xxhash64', // v5.54.0+，该算法更快
    path: resolve('./dist', targetPath),
    publicPath: '/',
    libraryTarget: 'commonjs2',
    filename: 'server.js',
  },
  externals: /vue*/i, // vue-server-renderer 依赖vue
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(), /** terser js代码压缩 */
    ]
  },
}
