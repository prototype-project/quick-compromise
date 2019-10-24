import Vue from 'vue';
import {shallowMount} from "@vue/test-utils"

import SingleTranslation from './single-translation';
import {Translation} from "./translations";
import {TranslationSavedEvent} from "../event-bus";

describe('Single translation', () => {
  let app;
  let eventBus;
  let translation;
  let wrapper;

  beforeEach(() => {
    eventBus = new Vue();
    translation = new Translation("userId", "Cześć", "Hi", "translationId");
    wrapper = shallowMount(eventBus);

    const Constructor = Vue.extend(SingleTranslation);
    app = new Constructor({
      propsData: {translation: translation, index: 0, eventBus: wrapper.vm}
    }).$mount();
  });

  it('should save existing translation', () => {
    // when
    app.word = "Zmienione";
    app.translatedWord = "Changed";
    app.save();

    // then
    let event = wrapper.emitted()['translation-saved'][0][0];
    let expectedTranslation = new Translation("userId", "Zmienione", "Changed", "translationId");
    let expectedEvent = new TranslationSavedEvent(expectedTranslation, 0);
    assert.deepEqual(event, expectedEvent);
  });

  it('should save new translation', () => {
    // when
    translation.word = "";
    translation.transaction = "";
    translation.translationId = "";

    app.word = "Zmienione";
    app.translatedWord = "Changed";
    app.save();

    // then
    let event = wrapper.emitted()['translation-saved'][0][0];
    let expectedTranslation = new Translation("userId", "Zmienione", "Changed");
    let expectedEvent = new TranslationSavedEvent(expectedTranslation, 0);
    assert.deepEqual(event, expectedEvent);
  });

  it('should not save translation if word is empty', () => {
    // when
    app.word = "";
    app.save();

    // then
    assert.equal(wrapper.emitted()['translation-saved'], undefined);
  });

  it('should not save translation if translation is empty', () => {
    // when
    app.translatedWord = "";
    app.save();

    // then
    assert.equal(wrapper.emitted()['translation-saved'], undefined);
  });
});