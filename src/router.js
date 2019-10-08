import LoginForm from './auth/login-form';
import VueRouter from "vue-router";

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    {
      path: '/',
      name: 'LoginForm',
      component: LoginForm
    }
  ]
});