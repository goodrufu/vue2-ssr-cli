# vue2-ssr

## 环境配置

### 开发环境
1. 执行：`pnpm dev`
2. 访问：[本地8080端口](http://localhost:8080/)

### 生产环境
1. 执行: `pnpm build`
2. 待打包完成，在`dist`文件夹即时所有代码
3. 执行：`node /dist/server.js`，即运行打包后的代码

## 待补充功能
1. TDK功能
2. site map

## 注意事项
1. 打包后`server.js`是固定服务端渲染执行代码，注意文件冲突
2. 目前打包后的文件夹，固定为：根目录`dist`文件夹即时所有代码

### 使用方式
1. `store/index.js`是固定的store入口，子store可以根据vuex进行处理
2. `router/index.js`是固定的vue-router入口，子router可以根据vue-router进行处理
3. `App.vue`是项目的dom主入口
4. `entry-client.js`是SSR客户端渲染的主入口，可以理解为SPA项目的`main.js`，包括引入仅客户端使用的组件、插件等
5. `entry-client.js`是SSR服务端渲染的主入口，该入口的代码会走服务端渲染，需要注意node和web环境的差异性
6. `main.js`是`entry-client.js`和`entry-server.js`的共同入口，便于处理两端都要处理的代码
7. 其他结构完全理解为vue SPA脚手架结构即可

### 概念
1. 该脚手架技术栈：vue2 + vue-router + vuex，vue2采用options方式组织代码
2. 在【路由页面】提供option：`asyncData`（类似nuxt.js），目前提供两个参数：实例化后的`store`和`route`
3. `asyncData`为可以提供服务端接口调用，需要与参数`store`结合使用

## SSR优化规则
1. URL结构
   1. 层级应当尽量浅，例如：首页-分类-详情的结构
   2. 二级域名优先于pathname
   3. 减少参数query的方式，例如：`www.baidu.com?a=123`，而是`www.baidu.com/123`
2. 标题和META标签
   1. TDK是网站的简要描述，应当简洁、清晰明了，适当重复关键词
   2. 关键词应特殊，避免相同关键词排名靠后，趁热度则相反，追随热度关键词
   3. 网站唯一关键词应在TDK反复出现
   4. 关键词分隔符应当固定，例如：`-`、`,`
3. 内容关键字
   1. 网站关键字应当出现在：网页标题中、META标签中、内容标题中（用<h1>标签）、内容文本中（用<b>标签加粗）
   2. 密度不能过高，每百字有1-2次，重复是一种技巧
   3. 关键词不能过多，例如：京东商城，那么京东就是关键字
   4. 次关键词可以多一些，例如：京东商城，那么商城、手机、美妆等就算一种次关键字
4. 内容
   1. <img>需要有alt属性描述
   2. `<a>`需要有title属性描述
   3. 适当地使用`<h1>`、`<h2>`、`<b>`标签等
   4. 内容不宜过多，建议100 - 300字
   5. 内部链接应该有结构性，像一棵树一样
   6. 需要导航（面包屑）
5. 其他有利因素
   1. 著名目录收入
   2. 域名年龄
   3. 二级域名比子目录好
   4. 网页size减小，不要大于100k
   5. 广告少
   6. 跟着竞争对手走（关键字等）
   7. SEM
   8. ...
6. 其他不利因素
   1. 服务器带宽过低
   2. 网站被k过 （换域名吧）
   3. 内部链接结构混乱
   4. 动态网页、框架网页（iframe）等
   5. 关键字不够精准
   6. 用户留存时间过短、跳出率过高、退出率过高
   7. 存在死链
   8. ...

## SSR分析工具
1. [站长工具](https://tool.chinaz.com/)
