<script setup>
import { unitLabel } from '@/lib/catalog'
import { formatDate, formatPercent, formatPriceLabel } from '@/lib/format'

defineProps({
  product: { type: Object, required: true },
  snapshot: { type: Object, required: true },
})

/** @param {'hausse' | 'baisse' | 'stable' | 'nouveau' | 'vide'} trend */
function barClass(trend) {
  if (trend === 'hausse') return 'bg-clay'
  if (trend === 'baisse') return 'bg-moss'
  return 'bg-line'
}

/** @param {'hausse' | 'baisse' | 'stable' | 'nouveau' | 'vide'} trend */
function textClass(trend) {
  if (trend === 'hausse') return 'text-clay'
  if (trend === 'baisse') return 'text-moss'
  return 'text-muted'
}
</script>

<template>
  <RouterLink
    :to="`/produit/${product.id}`"
    class="flex overflow-hidden rounded-3xl border border-line bg-card transition hover:border-moss/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
  >
    <span class="w-1 shrink-0" :class="barClass(snapshot.trend)" aria-hidden="true"></span>
    <span class="flex min-w-0 flex-1 flex-col gap-3 px-4 py-4">
      <span class="flex items-start justify-between gap-4">
        <span class="min-w-0">
          <span class="block truncate text-base font-medium text-ink">{{ product.name }}</span>
          <span class="mt-1 block text-sm text-muted">
            {{ unitLabel(product.unit) }}
            <template v-if="snapshot.last?.store"> · {{ snapshot.last.store }}</template>
          </span>
        </span>
        <span v-if="snapshot.current != null" class="shrink-0 text-right">
          <span class="block font-serif text-[1.65rem] leading-none tracking-tight text-ink">
            {{ formatPriceLabel(snapshot.current, product.unit, snapshot.last.quantity) }}
          </span>
          <span class="mt-2 block text-sm" :class="textClass(snapshot.trend)">
            <template v-if="snapshot.delta != null">{{ formatPercent(snapshot.delta) }}</template>
            <template v-else-if="snapshot.trend === 'nouveau'">Premier prix</template>
            <template v-else>Stable</template>
          </span>
        </span>
      </span>
      <span v-if="snapshot.alternative" class="border-t border-line pt-3 text-sm text-moss">
        Moins cher : {{ snapshot.alternative.product.name }},
        {{ formatPriceLabel(snapshot.alternative.unitPrice, product.unit, 1) }}
      </span>
      <span v-else-if="snapshot.last" class="sr-only">
        Dernier prix le {{ formatDate(snapshot.last.date) }}
      </span>
    </span>
  </RouterLink>
</template>
