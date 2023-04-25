const fs = require('fs')
const path = require('path')
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
    runInNewContext: false
  }))
}

const templatePath = resolve('./index.template.html')

// 在生产中：使用模板创建服务器渲染器并构建服务器包。
// 服务器包由 vue-ssr-webpack-plugin 生成。
const template = fs.readFileSync(templatePath, 'utf-8')
const bundle = require('./vue-ssr-server-bundle.json')
// 客户端清单是可选的，但它允许渲染器
// 自动推断预加载/预取链接并直接添加 <script>
// 渲染期间使用的任何异步块的标签，避免瀑布请求。
const clientManifest = require('./vue-ssr-client-manifest.json')
const renderer = createRenderer(bundle, {
  template,
  clientManifest
})

const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache ? 1000 * 60 * 60 * 24 * 30 : 0
})

app.use(compression({ threshold: 0 }))
app.use('/', serve('./', true))

// url缓存，用户个性化的内容不应当在ssr侧渲染
app.use(microcache.cacheSeconds(1, req => req.originalUrl))

function render(req, res) {
  res.setHeader('Content-Type', 'text/html')

  const handleError = err => {
    if (err.url) {
      res.redirect(err.url)
    } else if (err.code === 404) {
      res.status(404).send('404 | url找不到')
    } else {
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
  })
}

app.get('*', render)

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})
