import Vue from 'vue';

import {EasydbClient} from '../easydb-client';
import LoginForm from './login-form';
import User from './user';

const {GenericContainer} = require("testcontainers");
const expect = require('chai').expect;
const assert = require('chai').assert;

describe('Authentication', () => {
  let container;
  let client;
  let app;

  before(async () => {
    container = await new GenericContainer("faderskd/easydb-testcontainer")
      .withExposedPorts(9000)
      .start();

    client = new EasydbClient(`http://${container.getContainerIpAddress()}:${container.getMappedPort(9000)}`);
  });

  beforeEach(async () => {
    let spaceName = await client.createSpace();
    let bucketName = "users";
    let user = new User(client, spaceName, "user", "password");

    await client.createBucket(spaceName, bucketName);
    await user.create();

    const Constructor = Vue.extend(LoginForm);
    app = new Constructor({
      propsData: {easydbClient: client, spaceName: spaceName}
    }).$mount();
  });

  it('should login to account', async () => {
    // given
    app.formInput.username = "user";
    app.formInput.password = "password";

    expect(app.user.isAuthenticated()).to.be.false;
    expect(app.formInput.submitted).to.be.false;

    // when
    await app.submit();

    // then
    expect(app.user.isAuthenticated()).to.be.true;
    expect(app.formInput.submitted).to.be.true;
    assert(app.errors, {});
    expect(app.isValid(app.fields.PASSWORD_FIELD)).to.be.true;
    expect(app.isValid(app.fields.USERNAME_FIELD)).to.be.true;
  });

  after(async () => {
    await container.stop()
  });
});