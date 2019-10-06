import {Element} from "../easydb-client";

import {Base64} from "js-base64";

export default class User {
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

  delete() {

  }

  async authenticate() {
    await this.easydbClient.getElement(this.spaceName, this.bucketName, this.encodedCredentials);
    this.authenticated = true;
  };

  isAuthenticated() {
    return this.authenticated;
  }

  logout() {

  }
}