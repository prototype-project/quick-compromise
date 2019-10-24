<template>
    <div class="container">

    </div>
</template>

<script>
  export default {
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
      async saveTranslation(translation) {
        if (_.isEmpty(translation.translationId)) {
          let translationWithId = await this.translationsClient.addTranslation(translation);
          this.translations.push(translationWithId);
          return translationWithId;
        }
        return null;
      },
      async updateTranslation(translation, index) {
        if (!_.isEmpty(translation.translationId)) {
          await this.translationsClient.updateTranslation(translation);
          this.translations[index] = translation;
        }
      }
    },
    async created() {
      this.eventBus.$on("translation-saved", async event => {
        await this.saveTranslation(event.translation, event.index);
      });
      await this.fetchTranslations();
    }
  }
</script>