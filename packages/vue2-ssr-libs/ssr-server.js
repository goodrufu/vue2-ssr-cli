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
    /** 服务端入口 */
    serverEntry () {
      return content => {
        return new Promise((resolve, reject) => {
          _router.push(content.url)

          _router.onReady(() => {
            const matchedComponents = _router.getMatchedComponents()

            if (!matchedComponents.length) {
              return resolve(_appVue)
            }

            Promise.all(matchedComponents.map(component => {
              if (component.asyncData) {
                return component.asyncData({ store: _store, route: _router.currentRoute })
              }
              return Promise.resolve()
            }))
              .then((arr) => {
                content.state = _store.state
                resolve(_appVue)
              })
              .catch(reject)
            resolve(_appVue)
          }, reject)
        })
      }
    }
  }
}
