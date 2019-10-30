import Vue from 'vue';

import TranslationList from './translation-list';
import {Translation, TranslationClient} from "./translations";
import {EasydbClient} from "../easydb/easydb-client";
import {User} from "../auth/user";

const {GenericContainer} = require("testcontainers");

describe('Translation list', () => {
  let app;
  let translationClient;
  let container;
  let client;
  let eventBus;
  let user;
  let spaceName;

  before(async () => {
    container = await new GenericContainer("faderskd/easydb-testcontainer")
      .withExposedPorts(9000)
      .start();

    client = new EasydbClient(`http://${container.getContainerIpAddress()}:${container.getMappedPort(9000)}`);
    // client = new EasydbClient(`http://localhost:9000`);
  });

  beforeEach(async () => {
    eventBus = new Vue();
    spaceName = await client.createSpace();
    translationClient = new TranslationClient(client, spaceName);
    user = new User(client, spaceName);

    user.setCredentials("username", "password");
    await user.create();
    await user.authenticate();

    let Constructor = Vue.extend(TranslationList);
    app = new Constructor({
      propsData: {translationsClient: translationClient, user: user, eventBus: eventBus}
    }).$mount();
  });

  it('should save and fetch translations', async () => {
    // given
    let translation1 = new Translation(user.getId(), "przykład1", "example1");
    let translation2 = new Translation(user.getId(), "przykład2", "example2");
    app.addEmptyTranslation();
    app.addEmptyTranslation();

    // when
    let added1 = await app.saveTranslation(translation1, 0);
    let added2 = await app.saveTranslation(translation2, 1);

    // and when
    await app.fetchTranslations();

    // then
    assert.deepEqual(app.translations, [added1, added2]);
  });

  it('should update translation', async () => {
    // given
    let originalTranslation = new Translation(user.getId(), "oryginalne słowo", "original word");
    app.addEmptyTranslation();
    let originalSaved = await app.saveTranslation(originalTranslation);
    let changedTranslation = new Translation(user.getId(), "zmienione słowo", "changed word", originalSaved.translationId);

    // when
    await app.updateTranslation(changedTranslation, 0);

    // and when
    await app.fetchTranslations();

    // then
    assert.deepEqual(app.translations, [changedTranslation]);
  });
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}