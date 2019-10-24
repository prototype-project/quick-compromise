import {Element} from "../easydb/easydb-client";

import {Base64} from "js-base64";

export {User, AuthenticationError, RegisterError};

class User {
  constructor(easydbClient, spaceName) {
    this.easydbClient = easydbClient;
    this.spaceName = spaceName;
    this.bucketName = "users";
    this.authenticated = false;
    this.encodedCredentials = "";
  }

  setCredentials(username, password) {
    this.encodedCredentials = Base64.encode(`${username}:${password}`);
  }

  async create() {
    try {
      await this._create();
    } catch (error) {
      if (error.elementAlreadyExist()) {
        throw new RegisterError(error.errorData);
      } else if (error.bucketDoesNotExist()) {
        await this._createBucket();
        await this._create();
      } else {
        throw error;
      }
    }
  }

  async _create() {
    return await this.easydbClient.addElement(
      this.spaceName,
      this.bucketName,
      new Element(this.encodedCredentials));
  }

  async _createBucket() {
    return await this.easydbClient.createBucket(
      this.spaceName,
      this.bucketName
    )
  }

  async authenticate() {
    try {
      await this.easydbClient.getElement(this.spaceName, this.bucketName, this.encodedCredentials);
      this.authenticated = true;
    } catch (error) {
      if (error.elementDoesNotExist() || error.bucketDoesNotExist()) {
        throw new AuthenticationError(error.errorData);
      }
      throw error;
    }
  };

  getId() {
    return this.encodedCredentials;
  }

  isAuthenticated() {
    return this.authenticated;
  }
}

class AuthenticationError extends Error {
  constructor(errorData) {
    super();
    this.errorData = errorData;
  }
}

class RegisterError extends Error {
  constructor(errorData) {
    super();
    this.errorData = errorData;
  }
}