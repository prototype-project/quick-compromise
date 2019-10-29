import LoginForm from './auth/login-form';
import RegisterForm from './auth/register-form';
import TranslationsList from './translations/translation-list';
import VueRouter from "vue-router";
import Config from './config';
import {EasydbClient} from './easydb/easydb-client';
import {User} from './auth/user';
import {EventBus} from "./event-bus";
import {TranslationClient} from "./translations/translations";

const easydbClient = new EasydbClient(Config.EASYDB_URL);
const user = new User(easydbClient, Config.SPACE_NAME);
const translationClient = new TranslationClient(easydbClient, Config.SPACE_NAME);

const router = new VueRouter({
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
    },
    {
      path: '/translations',
      name: 'TranslationsList',
      component: TranslationsList,
      props: {translationClient: translationClient, user: user, eventBus: EventBus},
      meta: {
        requiresAuth: true
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