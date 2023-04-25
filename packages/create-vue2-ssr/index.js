#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const { prompt } = require('enquirer')
const argv = require('minimist')(process.argv.slice(2))
const validateProjectName = require('validate-npm-package-name')
const { red, yellow } = require('kolorist')

const cwd = process.cwd()

const {
  hasGit,
  hasProjectGit,
  runCmd,
  cmdExists,
  isExist
} = require('./utils')

const renameFiles = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
  _editorconfig: '.editorconfig',
  _eslintignore: '.eslintignore',
  _browserslistrc: '.browserslistrc',
  '_eslintrc.js': '.eslintrc.js',
  '_package.json': 'package.json',
  '_tsconfig.json': 'tsconfig.json',
  '_babel.config.js': 'babel.config.js',
  '_README.md': 'README.md',
}

async function init() {
  let targetDir = argv._[0]

  const pkgManager = 'pnpm'

  if (!cmdExists('pnpm')) {
    console.log('\n')
    console.warn(yellow('create-vue2-ssr 使用 pnpm 安装依赖， 请先安装pnpm！'))
  }

  if (!targetDir) {
    const { name } = await prompt({
      type: 'input',
      name: 'name',
      message: '项目名称',
      initial: 'vue2-ssr-project',
      validate(val) {
        const result = validateProjectName(val)
        return !result.validForNewPackages
          ? `\n [vue2-ssr] 无效的项目名称: "${val}"， 命名规则： /^[a-z\\d][a-z\\d\\-_].*/`
          : true
      }
    })

    targetDir = name
  } else {
    const valid = validateProjectName(targetDir)
    if (!valid.validForNewPackages) {
      console.log(
        red(
          `\n [vue2-ssr] 无效的项目名称: "${targetDir}"， 命名规则： /^[a-z\\d][a-z\\d\\-_].*/\n `
        )
      )
      process.exit(1)
    }
  }

  const root = path.join(cwd, targetDir)
  let isInitGit = await shouldInitGit(root)

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  } else {
    const existing = fs.readdirSync(root)
    if (existing.length) {
      const { actionType } = await prompt({
        type: 'select',
        name: 'actionType',
        message: yellow(`${targetDir} 目录已存在, 请确认操作：`),
        choices: [
          {
            name: 'delete',
            message: '删除'
          },
          {
            name: 'cover',
            message: '覆盖'
          },
          {
            name: 'cancel',
            message: '取消'
          }
        ]
      })

      if (actionType === 'delete') emptyDir(root)
      else if (actionType === 'cover') {
        isInitGit = !isExist(path.join(root, '.git'))
      } else return
    }
  }

  console.log(`\nbuild project in ${root}...`)
  const templateDir = path.join(__dirname, 'template')

  function writeFile(file, content) {
    let targetPath = renameFiles[file]
      ? path.join(root, renameFiles[file])
      : path.join(root, file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  const files = fs.readdirSync(templateDir)
  files.filter((f) => f !== '_package.json').map((file) => writeFile(file))
  const pkg = require(path.join(templateDir, '_package.json'))
  pkg.name = path
    .basename(root)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[~)('!*]+/g, '-')

  writeFile('package.json', JSON.stringify(pkg, null, 2))

  isInitGit && (await runCmd('git', ['init'], { cwd: root }))

  const cmdArgs = ['i']

  console.log('\nInstailling Dependencies...')
  await runCmd(pkgManager, cmdArgs, { cwd: root })
  await runCmd(pkgManager, ['lint:fix'], { cwd: root })
  isInitGit && (await runCmd('git', ['add', '-A'], { cwd: root }))
  isInitGit &&
    (await runCmd('git', ['commit', '-m', 'init', '--no-verify'], {
      cwd: root
    }))

  if (root !== cwd) {
    console.log(yellow(`  cd ${path.relative(cwd, root)}`))
    console.log(yellow('  pnpm dev'))
  }
  console.log()
}
function copy(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file)
    if (fs.lstatSync(abs).isDirectory()) {
      emptyDir(abs)
      fs.rmdirSync(abs)
    } else {
      fs.unlinkSync(abs)
    }
  }
}

async function shouldInitGit(cwd) {
  if (!hasGit()) return false
  if (hasProjectGit(cwd)) return false
  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    initial: 'Y',
    message: '初始化 git 仓库吗？'
  })

  return yes
}

init().catch(e => {
  console.error(e)
})
