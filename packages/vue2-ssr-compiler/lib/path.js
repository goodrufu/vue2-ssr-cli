const path = require('path')


module.exports = {
  targetPath: process.cwd(),
  resolve: (url, target = __dirname) => path.resolve(target, url)
}
