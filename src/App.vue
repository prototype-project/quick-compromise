<template>
    <div>
        <router-link :to="{ name: 'LoginForm' }">Login</router-link>
        <router-link :to="{ name: 'RegisterForm' }">Register</router-link>
        <router-link :to="{ name: 'TranslationsList' }">Translations</router-link>
        <router-view class="view"></router-view>
    </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>