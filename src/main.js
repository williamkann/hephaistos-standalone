import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import VueAxios from 'vue-axios'
import store from './vue/store/index.js'
import VueDraggable from 'vuedraggable'

Vue.use(VueAxios, axios, VueDraggable)

axios.defaults.withCredentials = true // this line here ! Axios envoie les cookies à votre server
Vue.config.productionTip = false

var filter = function (text, length, clamp) {
  clamp = clamp || '...'
  var node = document.createElement('div')
  node.innerHTML = text
  var content = node.textContent
  return content.length > length ? content.slice(0, length) + clamp : content
}
Vue.filter('truncate', filter)

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
