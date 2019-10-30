import {Query} from "../easydb/easydb-client";
import {Element} from "../easydb/easydb-client";

export {TranslationClient, Translation};

class TranslationClient {
  constructor(easydbClient, spaceName) {
    this.easydbClient = easydbClient;
    this.spaceName = spaceName;
    this.bucketName = "translations";
  }

  async fetchTranslations(userId) {
    try {
      return await this._fetchTranslations(userId);
    } catch (error) {
      if (error.bucketDoesNotExist()) {
        return [];
      } else {
        throw error;
      }
    }
  }

  async _fetchTranslations(userId) {
    let elements = await this.easydbClient.queryElements(this.spaceName, this.bucketName, TranslationClient.buildQuery(userId));
    return elements.map(e => {
      return new Translation(
        e.getFieldValue("userId"),
        e.getFieldValue("word"),
        e.getFieldValue("translation"),
        e.id);
    });
  }

  async addTranslation(translation) {
    try {
      return await this._addTranslation(translation);
    } catch (error) {
      if (error.bucketDoesNotExist()) {
        await this._createBucket();
        return await this._addTranslation(translation);
      } else {
        throw error;
      }
    }
  }

  async _addTranslation(translation) {
    let element = await this.easydbClient.addElement(this.spaceName, this.bucketName,
      new Element()
        .addField("userId", translation.userId)
        .addField("word", translation.word)
        .addField("translation", translation.translation));
    return new Translation(translation.userId, translation.word, translation.translation, element.id);
  }

  async _createBucket() {
    return await this.easydbClient.createBucket(
      this.spaceName,
      this.bucketName
    )
  }

  async updateTranslation(translation) {
    await this.easydbClient.updateElement(this.spaceName, this.bucketName, translation.translationId,
      new Element()
        .addField("userId", translation.userId)
        .addField("word", translation.word)
        .addField("translation", translation.translation));
  }

  static buildQuery(userId) {
    let rawQuery = Query.root().withField("userId", userId).build();
    return encodeURI(rawQuery);
  }
}

class Translation {
  constructor(userId, word = "", translation = "", translationId = "") {
    this.userId = userId;
    this.word = word;
    this.translation = translation;
    this.translationId = translationId;
  }
}