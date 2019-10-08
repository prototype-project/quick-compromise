import {Element} from "../easydb/easydb-client";

import {Base64} from "js-base64";

export {User, AuthenticationError}

class User {
  constructor(easydbClient, spaceName, name = "", password = "") {
    this.easydbClient = easydbClient;
    this.spaceName = spaceName;
    this.bucketName = "users";
    this.authenticated = false;
    this.encodedCredentials = Base64.encode(`${name}:${password}`);
  }

  async create() {
    return await this.easydbClient.addElement(
      this.spaceName,
      this.bucketName,
      new Element(this.encodedCredentials));
  }

  async authenticate() {
    try {
      await this.easydbClient.getElement(this.spaceName, this.bucketName, this.encodedCredentials);
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

  logout() {

  }
}

class AuthenticationError extends Error {
  constructor(errorData) {
    super();
    this.errorData = errorData;
  }
}