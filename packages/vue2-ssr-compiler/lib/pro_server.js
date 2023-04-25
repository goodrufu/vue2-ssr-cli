const webpack = require('webpack')
const fs = require('fs')
const path = require('path')

const clientConfig = require('./webpack/client')
const serverConfig = require('./webpack/server')
const serviceConfig = require('./webpack/service')

const resolve = (url, base = __dirname) => path.resolve(base, url)

webpack(clientConfig, (err, stats) => {
  if (err || stats.hasErrors()) {
    throw Error('构建web包失败！')
  }

  console.log('构建web包完成！')
})

webpack(serverConfig, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.log(err)
    throw Error('构建服务端包失败！')
  }

  console.log('构建服务端包完成！')
  buildService()
})

function buildService () {
  webpack(serviceConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log(err, stats)
      throw Error('构建服务端渲染服务失败！')
    }

    console.log('服务端渲染服务打包完成！')

    const { targetPath } = require('./path')

    function copyFile (src, dist) {
      fs.writeFileSync(dist, fs.readFileSync(src))
    }

    copyFile(resolve('../template/index.template.html'), resolve('./dist/index.template.html', targetPath))
  //   copyFile(resolve('../template/server.js'), resolve('./dist/server.js', targetPath))
  })
}
