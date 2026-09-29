/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} unit
 */

/**
 * @typedef {Object} PriceEntry
 * @property {string} id
 * @property {string} productId
 * @property {number} amount
 * @property {number} quantity
 * @property {string} date
 * @property {string} store
 */

/**
 * @typedef {'nouveau' | 'stable' | 'hausse' | 'baisse'} PriceTrend
 */

/**
 * @param {number} amount
 * @param {number} quantity
 */
export function unitPrice(amount, quantity) {
  if (!quantity) return amount
  return amount / quantity
}

/** @param {number} value */
function cents(value) {
  return Math.round(value * 100)
}

/**
 * @param {number | null | undefined} previous
 * @param {number} current
 * @param {number} [threshold]
 * @returns {PriceTrend}
 */
export function priceTrend(previous, current, threshold = 0.01) {
  if (previous == null || Number.isNaN(previous)) return 'nouveau'
  if (previous === 0) return current === 0 ? 'stable' : 'hausse'
  const ratio = Math.abs(current - previous) / previous
  if (ratio < threshold) return 'stable'
  return current > previous ? 'hausse' : 'baisse'
}

/**
 * @param {number | null | undefined} previous
 * @param {number} current
 * @returns {number | null}
 */
export function priceDeltaRatio(previous, current) {
  if (previous == null || previous === 0) return null
  return (current - previous) / previous
}

/** @param {PriceEntry[]} entries */
export function sortedEntries(entries) {
  return [...entries].sort((a, b) => {
    if (a.date === b.date) {
      if (a.id === b.id) return 0
      return a.id < b.id ? -1 : 1
    }
    return a.date < b.date ? -1 : 1
  })
}

/** @param {PriceEntry[]} entries */
export function lastUnitPrice(entries) {
  const last = sortedEntries(entries).at(-1)
  if (!last) return null
  return unitPrice(last.amount, last.quantity)
}

/** @param {PriceEntry[]} entries */
export function previousUnitPrice(entries) {
  const sorted = sortedEntries(entries)
  if (sorted.length < 2) return null
  const previous = sorted.at(-2)
  return unitPrice(previous.amount, previous.quantity)
}

/**
 * Alternative moins chère, même catégorie et même unité.
 * @param {Product} product
 * @param {Product[]} products
 * @param {Record<string, PriceEntry[]>} entriesByProduct
 * @returns {{ product: Product, unitPrice: number, savings: number } | null}
 */
export function cheaperAlternative(product, products, entriesByProduct) {
  const ownPrice = lastUnitPrice(entriesByProduct[product.id] ?? [])
  if (ownPrice == null) return null

  /** @type {{ product: Product, unitPrice: number, savings: number } | null} */
  let best = null

  for (const other of products) {
    if (other.id === product.id) continue
    if (other.category !== product.category || other.unit !== product.unit) continue
    const price = lastUnitPrice(entriesByProduct[other.id] ?? [])
    if (price == null || cents(price) >= cents(ownPrice)) continue
    if (!best || price < best.unitPrice) {
      best = {
        product: other,
        unitPrice: price,
        savings: (cents(ownPrice) - cents(price)) / 100,
      }
    }
  }

  return best
}

/**
 * @param {Product} product
 * @param {PriceEntry[]} entries
 * @param {Product[]} products
 * @param {Record<string, PriceEntry[]>} entriesByProduct
 */
export function productSnapshot(product, entries, products, entriesByProduct) {
  const ordered = sortedEntries(entries)
  const last = ordered.at(-1) ?? null
  const previous = ordered.at(-2) ?? null
  const current = last ? unitPrice(last.amount, last.quantity) : null
  const before = previous ? unitPrice(previous.amount, previous.quantity) : null

  return {
    last,
    previous,
    current,
    before,
    trend: current == null ? 'vide' : priceTrend(before, current),
    delta: current == null ? null : priceDeltaRatio(before, current),
    alternative: cheaperAlternative(product, products, entriesByProduct),
  }
}
