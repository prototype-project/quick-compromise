import LoginForm from './auth/login-form';
import RegisterForm from './auth/register-form';
import VueRouter from "vue-router";
import Config from './config';
import {EasydbClient} from './easydb/easydb-client';
import {User} from './auth/user';

const user = new User(new EasydbClient(Config.EASYDB_URL), Config.SPACE_NAME);

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    {
      path: '/login',
      name: 'LoginForm',
      component: LoginForm,
      props: {user: user},
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/register',
      name: 'RegisterForm',
      component: RegisterForm,
      props: {user: user},
      meta: {
        requiresAuth: false
      }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (!user.isAuthenticated() && routeRequiresAuthentication(to)) {
    next("/login");
  } else {
    next();
  }
});

function routeRequiresAuthentication(toRoute) {
  return toRoute.meta.requiresArg;
}

export default router;