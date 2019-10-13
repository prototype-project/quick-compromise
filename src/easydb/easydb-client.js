const fetch = require("node-fetch");

export {EasydbClient, Element, Field, EasydbClientException}

class EasydbClient {
  constructor(serverUrl) {
    this.spacesPath = "/api/v1/spaces";
    this.spacesUrl = serverUrl + this.spacesPath;
  }

  async createSpace() {
    let response = await EasydbClient.postData(this.buildSpaceUrl());
    let json = await response.json();
    return json.spaceName
  }

  async createBucket(spaceName, bucketName) {
    let bucket = new Bucket(bucketName);
    return await EasydbClient.postData(this.buildBucketUrl(spaceName), bucket.toJson());
  }

  async addElement(spaceName, bucketName, element) {
    let response = await EasydbClient.postData(this.buildElementUrl(spaceName, bucketName), element);
    return await response.json()
  }

  async getElement(spaceName, bucketName, id) {
    return await EasydbClient.getData(this.buildElementUrl(spaceName, bucketName, id));
  }

  buildSpaceUrl(spaceName = '') {
    return `${this.spacesUrl}/${spaceName}`;
  }

  buildBucketUrl(spaceName, bucketName = '') {
    return `${this.buildSpaceUrl(spaceName)}/buckets/${bucketName}`;
  }

  buildElementUrl(spaceName, bucketName, elementId = '') {
    return `${this.buildBucketUrl(spaceName, bucketName)}/elements/${elementId}`;
  }

  static async postData(url, data = {}) {
    let options = {
      method: "POST",
      headers: {'Content-Type': 'application/json'}
    };
    if (data) {
      options["body"] = JSON.stringify(data);
    }
    let response = await fetch(url, options);
    if (!response.ok) {
      let errorData = await response.json();
      throw new EasydbClientException(response.statusText, response.status, errorData);
    }
    return response;
  }

  static async getData(url) {
    let options = {
      method: "GET",
      headers: {'Content-Type': 'application/json'}
    };
    let response = await fetch(url, options);
    let json = await response.json();
    // console.log(url);
    // console.log(response.statusText);
    if (!response.ok) {
      throw new EasydbClientException(response.statusText, response.status, json);
    }
    return json
  }
}

class Bucket {
  constructor(bucketName) {
    this.bucketName = bucketName;
  }

  toJson() {
    return {
      "bucketName": this.bucketName
    }
  }

}

class Element {
  constructor(id, fields = []) {
    this.id = id;
    this.fields = fields;
  }

  addField(name, value) {
    this.fields.push(new Field(name, value));
    return this;
  }

  toJson() {
    return {
      id: this.id,
      fields: this.fields.map(f => f.toJson())
    }
  }
}

class Field {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  toJson() {
    return {
      name: this.name,
      value: this.value
    }
  }
}

class EasydbClientException extends Error {
  constructor(statusText, status, errorData) {
    super(statusText);
    this.status = status;
    this.errorData = errorData;
  }

  notFound() {
    return this.status === 404 && this.errorData.errorCode === "ELEMENT_DOES_NOT_EXIST";
  }

  bucketDoesNotExist() {
    return this.status === 404 && this.errorData.errorCode === "BUCKET_DOES_NOT_EXIST";
  }

  elementAlreadyExist() {
    return this.status === 400 && this.errorData.errorCode === "ELEMENT_ALREADY_EXISTS";
  }
}