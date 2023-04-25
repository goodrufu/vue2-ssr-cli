vue2-ssr

1. 全局依赖 pnpm install typescript -D -W
2. 局部依赖 pnpm install vue -r --filter xxx
3. 本地依赖 pkg 之间引用 pnpm i xx --workspace --filter xx
4. pnpm install @commitlint/cli @commitlint/config-conventional -D -W

## 运行vue2-ssr-demo
1. 安装所有依赖：`pnpm i`
2. 运行demo：`pnpm -r --filter vue2-ssr-demo dev`
3. 访问：`http://localhost:8080`

## 创建SSR项目
1. 添加npm仓库地址：`registry=http://xx`
2. 构建项目脚手架：`npx create-vue2-ssr [项目名称]`
3. 进入对应的文件夹：`cd [项目名称]`
4. 运行开发环境：`pnpm dev`
5. 代码打包：`pnpm build`
6. 生产环境执行代码：`node ./dist/server.js`


