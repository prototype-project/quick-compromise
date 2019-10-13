import Vue from 'vue';

import {EasydbClient} from '../easydb/easydb-client';
import RegisterForm from './register-form';
import {User} from './user';

const {GenericContainer} = require("testcontainers");

describe('Sign up', () => {
  let container;
  let client;
  let app;
  let spaceName;
  let user;

  before(async () => {
    container = await new GenericContainer("faderskd/easydb-testcontainer")
      .withExposedPorts(9000)
      .start();

    client = new EasydbClient(`http://${container.getContainerIpAddress()}:${container.getMappedPort(9000)}`);
  });

  beforeEach(async () => {
    spaceName = await client.createSpace();
    user = new User(client, spaceName);

    const Constructor = Vue.extend(RegisterForm);
    app = new Constructor({
      propsData: {user: new User(client, spaceName)}
    }).$mount();
  });

  it('should sign up', async () => {
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
    assert.deepEqual(app.errors, {});
    expect(app.isValid(app.fields.PASSWORD_FIELD)).to.be.true;
    expect(app.isValid(app.fields.USERNAME_FIELD)).to.be.true;
    expect(app.hasRegisterError(app.fields.USERNAME_FIELD)).to.be.false;
  });

  it('should validate form in case of empty fields', async () => {
    // when
    await app.submit();

    // then
    expect(app.user.isAuthenticated()).to.be.false;
    expect(app.formInput.submitted).to.be.true;
    assert.deepEqual(app.errors, {'username_field': "Username is required", 'password_field': 'Password is required'});
    expect(app.isValid(app.fields.PASSWORD_FIELD)).to.be.false;
    expect(app.isValid(app.fields.USERNAME_FIELD)).to.be.false;
    expect(app.hasRegisterError(app.fields.USERNAME_FIELD)).to.be.false;
  });

  it('should validate form in case of existing credentials', async () => {
    // given
    user.setCredentials("user", "password");
    await user.create();

    app.formInput.username = "user";
    app.formInput.password = "password";

    // when
    await app.submit();

    // then
    expect(app.user.isAuthenticated()).to.be.false;
    expect(app.formInput.submitted).to.be.true;
    assert.deepInclude(app.errors, {'register_error': 'User with given username already exists'});
    expect(app.isValid(app.fields.PASSWORD_FIELD)).to.be.true;
    expect(app.isValid(app.fields.USERNAME_FIELD)).to.be.true;
    expect(app.hasRegisterError(app.fields.USERNAME_FIELD)).to.be.true;
  });

  after(async () => {
    await container.stop()
  });
});