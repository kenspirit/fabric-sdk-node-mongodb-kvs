const MongoDBKVS = require('../index')
const assert = require('assert')

let kvsDB

describe('Test MongoKVS', () => {
  it('Test missing options - url', () => {
    assert.throws(() => {
      kvsDB = new MongoDBKVS({
        dbName: 'app',
        collectionName: 'kvs'
      })
    })
  })

  it('Test missing options - collectionName', () => {
    assert.throws(() => {
      kvsDB = new MongoDBKVS({
        url: 'mongodb://localhost:27017',
        dbName: 'app'
      })
    })
  })

  it('Test constructor', () => {
    return new MongoDBKVS({
      url: 'mongodb://localhost:27017',
      dbName: 'app',
      collectionName: 'kvs'
    })
    .then((db) => {
      kvsDB = db
    })
  })

  it('Test getValue & setValue', () => {
    const key = 'key'
    const value = 'value'

    return kvsDB.setValue(key, value)
      .then((valueResolved) => {
        assert.strictEqual(valueResolved, value)
        return kvsDB.getValue(key)
      })
      .then((valueInDB) => {
        assert.strictEqual(valueInDB, value)
      })
  })
})
