import { SSREntry } from 'vue2-ssr-libs/ssr-server'

import options from './main'

const entry = SSREntry({ ...options })

export default entry.serverEntry()
