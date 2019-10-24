const fetch = require("node-fetch");

export {EasydbClient, Element, Field, EasydbClientException, Query}

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
    let data = await response.json();
    return EasydbClient.mapToElement(data);
  }

  async updateElement(spaceName, bucketName, element) {
    await await EasydbClient.postData(this.buildElementUrl(spaceName, bucketName, element.id), element);
  }

  async getElement(spaceName, bucketName, id) {
    return await EasydbClient.mapToElement(
      await EasydbClient.getData(this.buildElementUrl(spaceName, bucketName, id)));
  }

  async queryElements(spaceName, bucketName, query) {
    let data = await EasydbClient.getData(this.buildQueryUrl(spaceName, bucketName, query));
    return data.results.map(EasydbClient.mapToElement);
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

  buildQueryUrl(spaceName, bucketName, query) {
    return `${this.buildBucketUrl(spaceName, bucketName)}/elements?query=${query}`;
  }

  static mapToElement(json) {
    let fields = json.fields.map(f => new Field(f.name, f.value));
    return new Element(json.id, fields);
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
    // console.log(json);
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
    this._fieldsMap = fields.reduce((map, f) => {
      map.set(f.name, f.value);
      return map;
    }, new Map());
  }

  addField(name, value) {
    this.fields.push(new Field(name, value));
    this._fieldsMap.set(name, value);
    return this;
  }

  getFieldValue(name) {
    return this._fieldsMap.get(name);
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

class Query {
  constructor() {
    this.ors = [];
    this.ands = [];
    this.fieldFilters = [];
  }

  static root() {
    return new RootQuery();
  }

  static create() {
    return new Query();
  }

  withField(name, value) {
    this.fieldFilters.push(new FieldQuery(name, value));
    return this;
  }

  or(nestedQueries) {
    nestedQueries.forEach(q => this.ors.push(q));
    return this;
  }

  and(nestedQueries) {
    nestedQueries.forEach(q => this.ands.push(q));
    return this;
  }

  validate() {
    let conditions = [!_.isEmpty(this.ors), !_.isEmpty(this.ands), !_.isEmpty(this.fieldFilters)];
    if (conditions.filter(v => v).length > 1) {
      throw new InvalidQueryException();
    }
  }

  build() {
    this.validate();
    let filter = "";
    if (!_.isEmpty(this.ors)) {
      filter = `or: [
        ${this.ors.map(q => `{ ${q.build()} }`).join(',')}
      ]`;
    } else if (!_.isEmpty(this.ands)) {
      filter = `and: [
        ${this.ands.map(q => `{ ${q.build()} }`).join(',')}
      ]`;
    } else if (!_.isEmpty(this.fieldFilters)) {
      filter = `fieldsFilters: [
          ${this.fieldFilters.map(f => `${f.build()}`).join(',')}]`;
    }
    return filter;
  }
}

class RootQuery extends Query {
  constructor() {
    super();
  }

  build() {
    let filter = super.build();
    if (!_.isEmpty(filter)) {
      filter = `(filter: {
        ${filter}
      })`;
    }
    return `
        {
            elements${filter} {
                id
                fields {
                    name 
                    value
                }
            }
        }`;
  }
}

class FieldQuery {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  build() {
    return `{
      name: "${this.name}"
      value: "${this.value}"
    }`;
  }
}

class EasydbClientException extends Error {
  constructor(statusText, status, errorData) {
    super(statusText);
    this.status = status;
    this.errorData = errorData;
  }

  elementDoesNotExist() {
    return this.status === 404 && this.errorData.errorCode === "ELEMENT_DOES_NOT_EXIST";
  }

  bucketDoesNotExist() {
    return this.status === 404 && this.errorData.errorCode === "BUCKET_DOES_NOT_EXIST";
  }

  elementAlreadyExist() {
    return this.status === 400 && this.errorData.errorCode === "ELEMENT_ALREADY_EXISTS";
  }
}

class InvalidQueryException extends Error {
}