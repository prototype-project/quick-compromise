import {Element} from "../easydb/easydb-client";

import {Base64} from "js-base64";

export {User, AuthenticationError, RegisterError};

class User {
  constructor(easydbClient, spaceName) {
    this.easydbClient = easydbClient;
    this.spaceName = spaceName;
    this.bucketName = "users";
    this.authenticated = false;
    this.username = "";
    this.password = "";
  }

  setCredentials(username, password) {
    this.username = username;
    this.password = password;
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
      new Element(this._encodeCredentials()));
  }

  async _createBucket() {
    return await this.easydbClient.createBucket(
      this.spaceName,
      this.bucketName
    )
  }

  async authenticate() {
    try {
      await this.easydbClient.getElement(this.spaceName, this.bucketName, this._encodeCredentials());
      this.authenticated = true;
    } catch (error) {
      if (error.notFound() || error.bucketDoesNotExist()) {
        throw new AuthenticationError(error.errorData);
      }
      throw error;
    }
  };

  isAuthenticated() {
    return this.authenticated;
  }

  _encodeCredentials() {
    return Base64.encode(`${this.username}:${this.password}`)
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