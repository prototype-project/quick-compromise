import LoginForm from './auth/login-form';
import VueRouter from "vue-router";
import Config from './config';
import {EasydbClient} from './easydb/easydb-client';
import {User} from './auth/user';

const user = new User(new EasydbClient(Config.EASYDB_URL), Config.SPACE_NAME);

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    {
      path: '/',
      name: 'LoginForm',
      component: LoginForm,
      props: {user: user}
    }
  ]
});