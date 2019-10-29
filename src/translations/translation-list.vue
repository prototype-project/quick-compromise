<template>
    <div class="container">
        <single-translation v-for="(t, index) in translations" :key="t.id" :translation="t" :index="index" :event-bus="eventBus">
        </single-translation>
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
      async saveTranslation(translation, index) {
        if (_.isEmpty(translation.translationId)) {
          let translationWithId = await this.translationsClient.addTranslation(translation);
          this.translations[index] = translation;
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