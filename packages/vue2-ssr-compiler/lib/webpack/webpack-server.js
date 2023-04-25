const fs = require('fs')
const path = require('path')
const { createFsFromVolume, Volume } = require('memfs')
const webpack = require('webpack')
const chokidar = require('chokidar')
const clientConfig = require('./client')
const serverConfig = require('./server')

const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
  } catch (e) { }
}

module.exports = function webpackService(app, templatePath, cb) {
  let bundle
  let template
  let clientManifest

  let ready
  const readyPromise = new Promise(r => { ready = r })
  const update = () => {
    if (bundle && clientManifest) {
      ready()
      cb(bundle, {
        template,
        clientManifest
      })
    }
  }

  template = fs.readFileSync(templatePath, 'utf-8')
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    console.log('index.html template updated.')
    update()
  })

  clientConfig.entry = ['webpack-hot-middleware/client', clientConfig.entry]
  clientConfig.output.filename = '[name].js'
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )

  // dev middleware
  const clientCompiler = webpack(clientConfig)
  const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    stats: 'errors-warnings'
  })
  app.use(devMiddleware)
  clientCompiler.hooks.done.tap('webpack-hot-middleware', stats => {
    stats = stats.toJson()

    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))

    if (stats.errors.length) return

    clientManifest = JSON.parse(readFile(devMiddleware.context.outputFileSystem, 'vue-ssr-client-manifest.json'))

    update()
  })

  app.use(require('webpack-hot-middleware')(clientCompiler, {
    heartbeat: 5000,
    log: false,
    path: '/__webpack_hmr',
    timeout: 2000,
    overlay: false,
    reload: true
  }))

  const serverCompiler = webpack(serverConfig)
  const serverFs = createFsFromVolume(new Volume())
  serverCompiler.outputFileSystem = serverFs
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    if (stats.errors.length) return

    bundle = JSON.parse(readFile(serverFs, 'vue-ssr-server-bundle.json'))
    update()
  })

  return readyPromise
}
