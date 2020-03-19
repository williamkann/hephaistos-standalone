import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Modules from '../components/Modules.vue'
import store from '../vue/store/index.js'
import Module from '../components/Module.vue'
import Exercises from '../components/Exercises.vue'

Vue.use(VueRouter)
/*
  beforeEnter 'Pare feu' pour se poser la question de si on a le droit d'afficher telle ou telle page.
  On le plug à tous les routes qui ont besoin de savoir si c'est auth.
  fetchUser qui rempli vuex afin de re verifier
*/
async function beforeEnter (_to, _from, next) {
  if (!store.getters['user/isAuthenticated']) {
    await store.dispatch('user/fetchUser')
  }
  if (store.getters['user/isAuthenticated']) {
    next()
    return
  }
  next('/login')
}

const routes = [
  {
    path: '/',
    name: 'modules',
    component: Modules,
    beforeEnter
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/module/:moduleId',
    name: 'module',
    component: Module,
    beforeEnter
  },
  {
    path: '/session/:sessionId/exercise/:exerciseId',
    name: 'exercises',
    component: Exercises,
    beforeEnter
  }
]

// admin@example.com
// password: vXNWYg49QG

/*
  Coté client;
  Docker-compose up pour créer le serveur
  lancer serveur avec npm run serve

  Coté serveur:
  npm run dev
  */

/*
  router: config les routes
  store : tout ce qui correspond à vuex

  */

/* Home.vue : la page principale

  */
export default new VueRouter({ routes })
