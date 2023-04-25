#!/usr/bin/env node

if (process.env.NODE_ENV === 'production') {
  require('../lib/pro_server')
} else {
  require('../lib/dev_server')
}
