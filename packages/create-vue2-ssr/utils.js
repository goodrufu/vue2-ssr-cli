var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};


const os = require('os')
const fs = require('fs')
const { execSync, spawn } = require('child_process')
const path = require('path')

let _hasGit = false
exports.hasGit = function hasGit() {
  if (_hasGit)
    return _hasGit
  try {
    execSync('git --version', { stdio: 'ignore' })
    return (_hasGit = true)
  }
  catch (e) {
    return (_hasGit = false)
  }
}

exports.hasProjectGit = function hasProjectGit(cwd) {
  let result = false
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    result = true
  }
  catch (e) {
    result = false
  }
  return result
}

exports.runCmd = function runCmd(cmd, args, opts = {}) {
  return __awaiter(this, void 0, void 0, function* () {
    return yield new Promise((resolve) => {
      const s = spawn(cmd, args, Object.assign({ cwd: process.cwd(), stdio: 'inherit', shell: true }, opts))
      s.on('exit', () => {
        resolve()
      })
    })
  })
}

exports.cmdExists = function cmdExists(cmd) {
  try {
    execSync(os.platform() === 'win32'
      ? `cmd /c "(help ${cmd} > nul || exit 0) && where ${cmd} > nul 2> nul"`
      : `command -v ${cmd}`)
    return true
  }
  catch (_a) {
    return false
  }
}

exports.isExist = function isExist(dir) {
  dir = path.normalize(dir)
  try {
    fs.accessSync(dir, fs.constants.R_OK)
    return true
  }
  catch (e) {
    return false
  }
}
