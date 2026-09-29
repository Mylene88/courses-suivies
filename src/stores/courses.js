import { openCoursesDb } from '@/lib/db'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * @param {string} name
 */
export function normalizeName(name) {
  return name.trim().toLocaleLowerCase('fr')
}

export const useCoursesStore = defineStore('courses', () => {
  /** @type {import('vue').Ref<import('@/lib/prices').Product[]>} */
  const products = ref([])
  /** @type {import('vue').Ref<import('@/lib/prices').PriceEntry[]>} */
  const entries = ref([])
  const ready = ref(false)
  const error = ref('')

  const entriesByProduct = computed(() => {
    /** @type {Record<string, import('@/lib/prices').PriceEntry[]>} */
    const map = {}
    for (const entry of entries.value) {
      if (!map[entry.productId]) map[entry.productId] = []
      map[entry.productId].push(entry)
    }
    return map
  })

  /** @param {string} name */
  function findByName(name) {
    const key = normalizeName(name)
    if (!key) return null
    return products.value.find((product) => normalizeName(product.name) === key) ?? null
  }

  async function hydrate() {
    try {
      const db = await openCoursesDb()
      products.value = await db.getAll('products')
      entries.value = await db.getAll('entries')
      error.value = ''
    } catch {
      error.value = 'Le carnet ne s’ouvre pas sur cet appareil.'
    } finally {
      ready.value = true
    }
  }

  /**
   * @param {{ name: string, category: string, unit: string, amount: number, quantity: number, date: string, store: string }} input
   */
  async function addPrice(input) {
    const db = await openCoursesDb()
    let product = findByName(input.name)

    if (!product) {
      product = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        category: input.category,
        unit: input.unit,
      }
      await db.put('products', product)
      products.value = [...products.value, product]
    }

    /** @type {import('@/lib/prices').PriceEntry} */
    const entry = {
      id: crypto.randomUUID(),
      productId: product.id,
      amount: input.amount,
      quantity: input.quantity,
      date: input.date,
      store: input.store.trim(),
    }
    await db.put('entries', entry)
    entries.value = [...entries.value, entry]
    return product
  }

  /** @param {string} id */
  async function removeEntry(id) {
    const db = await openCoursesDb()
    await db.delete('entries', id)
    entries.value = entries.value.filter((entry) => entry.id !== id)
  }

  /** @param {string} id */
  async function removeProduct(id) {
    const db = await openCoursesDb()
    const tx = db.transaction(['products', 'entries'], 'readwrite')
    await tx.objectStore('products').delete(id)
    const index = tx.objectStore('entries').index('by-product')
    for await (const cursor of index.iterate(id)) {
      await cursor.delete()
    }
    await tx.done
    products.value = products.value.filter((product) => product.id !== id)
    entries.value = entries.value.filter((entry) => entry.productId !== id)
  }

  return {
    products,
    entries,
    entriesByProduct,
    ready,
    error,
    findByName,
    hydrate,
    addPrice,
    removeEntry,
    removeProduct,
  }
})
