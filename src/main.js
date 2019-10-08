import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App';

import 'bootstrap/dist/css/bootstrap.min.css';

Vue.use(VueRouter);

import router from './router';

new Vue({
  router,
  template: '<App/>',
  components: {App}
}).$mount('#app');