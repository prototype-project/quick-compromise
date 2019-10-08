<template>
    <div class="container">
        <div class="row">
            <div class="col-sm">
                <form>
                    <div class="row form-group">
                        <input class="col-sm-4 offset-1 form-control" v-model="word" placeholder="Word">
                        <input class="col-sm-4 offset-1 form-control" v-model="translation" placeholder="Translation">
                    </div>
                </form>
                {{word}} {{translation}}
            </div>
        </div>
    </div>
</template>

<script>
  import User from '../auth/user';
  import EasydbClient from '../easydb/easydb-client';

  export default {
    data() {
      return {
        word: "",
        translation: ""
      };
    },
    methods: {
      async fetchTranslations(user) {
        return [];
      }
    }
  };
</script>