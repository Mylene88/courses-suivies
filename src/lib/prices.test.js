import { describe, expect, it } from 'vitest'

import { parseAmount, parseQuantity } from './format'
import { cheaperAlternative, priceDeltaRatio, priceTrend, sortedEntries, unitPrice } from './prices'

describe('prix unitaire', () => {
  it('divise le montant par la quantité', () => {
    expect(unitPrice(3.6, 6)).toBeCloseTo(0.6)
  })
})

describe('tendance', () => {
  it('marque un premier prix', () => {
    expect(priceTrend(null, 1.2)).toBe('nouveau')
  })

  it('ignore une variation inférieure à 1 %', () => {
    expect(priceTrend(1, 1.005)).toBe('stable')
  })

  it('repère une hausse et une baisse', () => {
    expect(priceTrend(1, 1.08)).toBe('hausse')
    expect(priceTrend(2, 1.5)).toBe('baisse')
  })

  it('calcule la variation relative', () => {
    expect(priceDeltaRatio(2, 2.2)).toBeCloseTo(0.1)
    expect(priceDeltaRatio(0, 1)).toBeNull()
  })
})

describe('alternative moins chère', () => {
  const lait = { id: 'lait', name: 'Lait entier', category: 'frais', unit: 'litre' }
  const demi = { id: 'demi', name: 'Lait demi-écrémé', category: 'frais', unit: 'litre' }
  const pain = { id: 'pain', name: 'Pain', category: 'frais', unit: 'pièce' }
  const pates = { id: 'pates', name: 'Pâtes', category: 'epicerie', unit: 'kg' }

  const entries = {
    lait: [{ id: 'a', productId: 'lait', amount: 1.2, quantity: 1, date: '2026-09-01', store: '' }],
    demi: [
      { id: 'b', productId: 'demi', amount: 0.95, quantity: 1, date: '2026-09-02', store: '' },
    ],
    pain: [{ id: 'c', productId: 'pain', amount: 0.4, quantity: 1, date: '2026-09-02', store: '' }],
    pates: [
      { id: 'd', productId: 'pates', amount: 0.5, quantity: 1, date: '2026-09-02', store: '' },
    ],
  }

  it('propose un produit du même rayon et de la même unité', () => {
    const alternative = cheaperAlternative(lait, [lait, demi, pain, pates], entries)
    expect(alternative?.product.name).toBe('Lait demi-écrémé')
    expect(alternative?.savings).toBeCloseTo(0.25)
  })

  it('ne propose rien si le produit est déjà le moins cher', () => {
    expect(cheaperAlternative(demi, [lait, demi], entries)).toBeNull()
  })
})

describe('historique', () => {
  it('trie par date', () => {
    const ordered = sortedEntries([
      { id: 'b', productId: 'p', amount: 2, quantity: 1, date: '2026-09-10', store: '' },
      { id: 'a', productId: 'p', amount: 1, quantity: 1, date: '2026-09-01', store: '' },
    ])
    expect(ordered.map((entry) => entry.id)).toEqual(['a', 'b'])
  })
})

describe('saisie', () => {
  it('accepte une virgule française', () => {
    expect(parseAmount('1,05')).toBe(1.05)
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('-1')).toBeNull()
  })

  it('refuse une quantité nulle', () => {
    expect(parseQuantity('0')).toBeNull()
    expect(parseQuantity('1,5')).toBe(1.5)
  })
})
