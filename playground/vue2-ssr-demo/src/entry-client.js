import { SSREntry } from 'vue2-ssr-libs/ssr-client'

import options from './main'

const entry = SSREntry({ ...options })
entry.clientEntry()

if (module.hot) {
  module.hot.accept()
}
