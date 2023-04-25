import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

Vue.use(Vuex)
Vue.use(VueRouter)

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

export function SSREntry ({ app, routes = [], store = {} } = {}) {
  const _router = new VueRouter({ mode: 'history', routes: routes })
  const _store = new Vuex.Store(store)
  const _appVue = new Vue({
    router: _router,
    store: _store,
    render: h => h(app)
  })

  return {
    /** 获取vue实例 */
    getAppVue () { return _appVue },
    /** 获取router实例 */
    getRouter () { return _router },
    /** 获取Store实例 */
    getStore () { return _store },

    /** 客户端入口 */
    clientEntry () {
      // const ProgressBar = require('./components/progress-bar.vue')
      // const ProgressConstructor = Vue.extend(ProgressBar)
      // const instance = new ProgressConstructor()
      // instance.$mount(document.createElement('div'))
      // document.body.appendChild(instance.$el)

      if (window.__INITIAL_STATE__) {
        _store.replaceState(window.__INITIAL_STATE__)
      }

      _router.onReady(() => {
        _router.beforeResolve((to, from, next) => {
          const matched = _router.getMatchedComponents(to)
          const prevMatched = _router.getMatchedComponents(from)

          let diffed = false
          const activated = matched.filter((c, i) => {
            return diffed || (diffed = (prevMatched[i] !== c))
          })

          if (!activated.length) {
            return next()
          }

          Promise.all(activated.map(c => {
            if (c.asyncData) {
              return c.asyncData({ store: _store, route: to })
            }
            return Promise.resolve()
          })).then(next).catch(next)
        })

        _appVue.$mount('#app')
      })
    }
  }
}
