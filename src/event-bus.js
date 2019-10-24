import Vue from 'vue';

export {EventBus, TranslationSavedEvent};

const EventBus = new Vue();

class TranslationSavedEvent {
  constructor(translation, index) {
    this.translation = translation;
    this.index = index;
  }
}