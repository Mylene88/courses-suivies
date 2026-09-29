/** @typedef {'frais' | 'epicerie' | 'boissons' | 'entretien' | 'autre'} CategoryId */
/** @typedef {'pièce' | 'kg' | 'litre' | 'botte'} UnitId */

/** @type {{ id: CategoryId, label: string }[]} */
export const CATEGORIES = [
  { id: 'frais', label: 'Frais' },
  { id: 'epicerie', label: 'Épicerie' },
  { id: 'boissons', label: 'Boissons' },
  { id: 'entretien', label: 'Entretien' },
  { id: 'autre', label: 'Autre' },
]

/** @type {{ id: UnitId, label: string }[]} */
export const UNITS = [
  { id: 'pièce', label: 'Pièce' },
  { id: 'kg', label: 'Kg' },
  { id: 'litre', label: 'Litre' },
  { id: 'botte', label: 'Botte' },
]

/** @param {string} id */
export function categoryLabel(id) {
  return CATEGORIES.find((item) => item.id === id)?.label ?? 'Autre'
}

/** @param {string} id */
export function unitLabel(id) {
  return UNITS.find((item) => item.id === id)?.label ?? id
}
