const path = require('path')
const fs = require('fs')
const LRU = require('lru-cache')
const express = require('express')
const compression = require('compression')
const microcache = require('route-cache')
const resolve = file => path.resolve(__dirname, file)
const { createBundleRenderer } = require('vue-server-renderer')

const app = express()

function createRenderer(bundle, options) {
  // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return createBundleRenderer(bundle, Object.assign(options, {
    cache: new LRU({
      max: 1000,
      ttl: 1000 * 60 * 15
    }),
    // 仅当 vue-server-renderer 是 npm-linked 时才需要
    // basedir: resolve('./dist'),
    runInNewContext: true
  }))
}

let renderer

const rootTemplate = path.resolve(process.cwd(), './index.template.html')
const exists = fs.existsSync(rootTemplate)
const templatePath = exists ? rootTemplate : resolve('../template/index.template.html')

// 开发中：使用 watch 和 hot-reload 设置开发服务器，
// 并在包/索引模板更新时创建一个新的渲染器。
const readyPromise = require('./webpack/webpack-server')(
  app,
  templatePath,
  (bundle, options) => {
    renderer = createRenderer(bundle, options)
  }
)

const serve = (path) => express.static(resolve(path), { maxAge: 0 })

app.use(compression({ threshold: 0 }))
app.use('/dist', serve('./dist'))
app.use('/public', serve('./public'))
app.use('/manifest.json', serve('./manifest.json'))

// 每个路由都独立缓存，用户个性化相关的不应再服务测渲染
app.use(microcache.cacheSeconds(1, req => req.originalUrl))

function render(req, res) {
  const s = Date.now()

  res.setHeader('Content-Type', 'text/html')

  const handleError = err => {
    if (err.url) {
      res.redirect(err.url)
    } else if (err.code === 404) {
      res.status(404).send('404 | url找不到')
    } else {
      // Render Error Page or Redirect
      res.status(500).send('500 | Internal Server Error')
      console.error(`ender 错误: ${req.url}`)
      console.error(err.stack)
    }
  }

  const context = {
    title: 'title',
    description: 'description',
    keyword: 'keyword',
    url: req.url
  }

  renderer.renderToString(context, (err, html) => {
    if (err) {
      return handleError(err)
    }
    res.send(html)
    console.log(`whole request: ${Date.now() - s}ms`)
  })
}

app.get('*', (req, res) => {
  console.log(req.url)
  readyPromise.then(() => render(req, res))
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})
