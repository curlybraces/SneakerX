import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

import axios from "axios";
const axiosRoute = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
})

import {isLoggedIn} from '../utils/auth'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function ({ store, ssrContext }) {
  const Router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })


  Router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isLoggedIn() && !store.state.auth.isLoggedIn) {
        next({name: 'auth'})
      } else {
        next()
      }
    } else if (to.matched.some(record => record.meta.requiresVisitor)) {
      if (isLoggedIn()) {
        next({name: 'home'})
      } else {
        next()
      }
    } else if (to.matched.some(record => record.meta.requiresAdmin)) {
      axiosRoute.post('/api/admin')
        .then(response => {
          console.log('success')
          console.log(response)
          next()
        }).catch(error => {
          console.log('error')
          console.log(error)
          next({name: 'home'})
      })
    } else {
      next() // make sure to always call next()!
    }
  })


  return Router
}
