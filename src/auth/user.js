import {Element} from "../easydb/easydb-client";

import {Base64} from "js-base64";

export {User, AuthenticationError}

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
    return await this.easydbClient.addElement(
      this.spaceName,
      this.bucketName,
      new Element(this._encodeCredentials()));
  }

  async authenticate() {
    try {
      await this.easydbClient.getElement(this.spaceName, this.bucketName, this._encodeCredentials());
      this.authenticated = true;
    } catch (error) {
      if (error.isNotFound()) {
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