<template>
    <div class="container">
        <div class="row">
            <div class="col-sm">
                <form>
                    <div class="row form-group">
                        <input class="col-sm-4 offset-1 form-control" v-model="word" @change="save"
                               placeholder="Word">
                        <input class="col-sm-4 offset-1 form-control" v-model="translatedWord" @change="save"
                               placeholder="Translation">
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
  import {TranslationSavedEvent} from "../event-bus";
  import {Translation} from "./translations";

  export default {
    props: {
      translation: {
        type: Object,
        required: true
      },
      index: {
        type: Number,
        required: true
      },
      eventBus: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        word: this.translation.word,
        translatedWord: this.translation.translation
      }
    },
    methods: {
      save() {
        if (this.validate()) {
          this.saveTranslation()
        }
      },
      validate() {
        return !_.isEmpty(this.word) && !_.isEmpty(this.translatedWord);
      },
      saveTranslation() {
        let newTranslation = new Translation(this.translation.userId, this.word, this.translatedWord, this.translation.translationId);
        let event = new TranslationSavedEvent(newTranslation, this.index);
        this.eventBus.$emit("translation-saved", event);
      }
    }
  }
</script>