import Vue from 'vue'

const {GenericContainer} = require("testcontainers");

describe('Translations', () => {

  let container;

  before(async () => {
    container = await new GenericContainer("faderskd/easydb-testcontainer")
      .withExposedPorts(9000)
      .start();
  });

  it('should fetch translations', () => {

  });

  after(async () => {
    await container.stop()
  });
});