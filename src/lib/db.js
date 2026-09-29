import { openDB } from 'idb'

const DB_NAME = 'courses-suivies'
const DB_VERSION = 1

export function openCoursesDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const products = db.createObjectStore('products', { keyPath: 'id' })
      products.createIndex('by-name', 'name')

      const entries = db.createObjectStore('entries', { keyPath: 'id' })
      entries.createIndex('by-product', 'productId')
    },
  })
}
