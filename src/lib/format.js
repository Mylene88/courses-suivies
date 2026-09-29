/** @param {number} value */
export function formatMoney(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

/** @param {number} ratio */
export function formatPercent(ratio) {
  const value = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 1,
  }).format(Math.abs(ratio * 100))
  if (ratio > 0) return `+${value} %`
  if (ratio < 0) return `−${value} %`
  return `${value} %`
}

/** @param {string} iso date YYYY-MM-DD */
export function formatDate(iso) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${iso}T12:00:00`))
}

/**
 * @param {number} value
 * @param {string} unit
 */
export function formatUnitPrice(value, unit) {
  const money = formatMoney(value)
  if (unit === 'litre') return `${money} / L`
  if (unit === 'pièce') return `${money} / pièce`
  return `${money} / ${unit}`
}

/**
 * @param {number} value
 * @param {string} unit
 * @param {number} quantity
 */
export function formatPriceLabel(value, unit, quantity) {
  if (unit === 'pièce' && quantity === 1) return formatMoney(value)
  return formatUnitPrice(value, unit)
}

export function todayIso() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

/** @param {string} raw */
export function parseAmount(raw) {
  const normalized = String(raw).trim().replace(/\s/g, '').replace(',', '.')
  if (!normalized) return null
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount < 0) return null
  return Math.round(amount * 100) / 100
}

/** @param {string} raw */
export function parseQuantity(raw) {
  const normalized = String(raw).trim().replace(/\s/g, '').replace(',', '.')
  if (!normalized) return null
  const quantity = Number(normalized)
  if (!Number.isFinite(quantity) || quantity <= 0) return null
  return Math.round(quantity * 1000) / 1000
}
