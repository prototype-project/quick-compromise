<template>
    <div class="container">
        <single-translation v-for="(t, index) in translations" :key="t.translationId" :translation="t" :index="index"
                            :event-bus="eventBus">
        </single-translation>
        <button class="btn btn-primary" v-on:click="addEmptyTranslation()">
            <i class="icon-user icon-white"></i> Add
        </button>
    </div>
</template>

<script>
  import {Translation} from "./translations";
  import SingleTranslation from "./single-translation";

  export default {
    components: {SingleTranslation},
    props: {
      translationsClient: {
        type: Object,
        required: true
      },
      user: {
        type: Object,
        required: true
      },
      eventBus: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        translations: []
      }
    },
    methods: {
      async fetchTranslations() {
        this.translations = await this.translationsClient.fetchTranslations(this.user.getId());
      },
      async addEmptyTranslation() {
        this.translations.push(new Translation(this.user.getId()));
        return this.translations.length - 1;
      },
      async saveOrUpdateTranslation(translation, index) {
        if (_.isEmpty(translation.translationId)) {
          return this.saveTranslation(translation, index);
        } else if (!_.isEmpty(translation.translationId)) {
          return this.updateTranslation(translation, index);
        } else {
          return null;
        }
      },
      async saveTranslation(translation, index) {
        let translationWithId = await this.translationsClient.addTranslation(translation);
        this.translations[index] = translation;
        return translationWithId;
      },
      async updateTranslation(translation, index) {
        await this.translationsClient.updateTranslation(translation);
        this.translations[index] = translation;
        return translation;
      }
    },
    async created() {
      this.eventBus.$on("translation-saved", async event => {
        await this.saveOrUpdateTranslation(event.translation, event.index);
      });
      await this.fetchTranslations();
    },
    beforeDestroy() {
      this.eventBus.$off("translation-saved");
    }
  }
</script>