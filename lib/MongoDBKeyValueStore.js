const debug = require('debug')('MongoDBKVS')
const mongodb = require('mongodb')

const { MongoClient } = mongodb

module.exports = class MongoDBKVS {
  constructor(options) {
    debug('Constructor Options: %j', options)
    const { url, dbName, collectionName, cacheResult } = options

    if (!url) {
      throw new Error('Missing URL in options')
    }
    if (!collectionName) {
      throw new Error('Missing collectionName in options')
    }

    const self = this
    this.cacheResult = cacheResult || false
    this.cacheResults = {}

    return MongoClient.connect(url)
      .then((client) => {
        const db = client.db(dbName)
        self.collection = db.collection(collectionName)
        return self
      })
  }

  getValue(name) {
    const nameString = String(name)
    debug('getValue: using %s', nameString)

    if (this.cacheResult && this.cacheResults[nameString]) {
      debug('Retrieved from cache item %s, Value %j', nameString, this.cacheResults[nameString])
      return Promise.resolve(this.cacheResults[nameString])
    }

    return this.collection.findOne({ _id: nameString })
      .then((record) => {
        debug('getValue: Got record %j', record)
        return record ? record.value : null
      })
      .catch((err) => {
        debug('getValue: Error %o', err)
        throw err
      })
  }

  setValue(name, value) {
    const nameString = String(name)
    debug('setValue: Name %s, Value %j', nameString, value)

    if (this.cacheResult && this.cacheResults[nameString]) {
      debug('Updated cache item %s, Value %j', nameString, value)
      this.cacheResults[nameString] = value
    }

    return this.collection.findOneAndUpdate(
      { _id: name },
      { $set: { value } },
      { upsert: true }
    )
      .then(() => {
        return value
      })
      .catch((err) => {
        debug('setValue: Error %o', err)
        throw err
      })
  }
}
