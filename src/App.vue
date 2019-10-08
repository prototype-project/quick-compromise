<template>
    <div>
        <router-link :to="{ name: 'LoginForm' }">Login</router-link>
        <router-view class="view"></router-view>
    </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>