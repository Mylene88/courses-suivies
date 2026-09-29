<script setup>
import ProductCard from '@/components/ProductCard.vue'
import { CATEGORIES, categoryLabel } from '@/lib/catalog'
import { productSnapshot } from '@/lib/prices'
import { useCoursesStore } from '@/stores/courses'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const store = useCoursesStore()
const { products, entriesByProduct } = storeToRefs(store)

const cards = computed(() =>
  products.value
    .map((product) => ({
      product,
      snapshot: productSnapshot(
        product,
        entriesByProduct.value[product.id] ?? [],
        products.value,
        entriesByProduct.value,
      ),
    }))
    .sort((a, b) => a.product.name.localeCompare(b.product.name, 'fr')),
)

const groups = computed(() =>
  CATEGORIES.map((category) => ({
    ...category,
    cards: cards.value.filter((card) => card.product.category === category.id),
  })).filter((group) => group.cards.length > 0),
)

const summary = computed(() => {
  const counts = { hausse: 0, baisse: 0, stable: 0 }
  for (const card of cards.value) {
    if (card.snapshot.trend === 'hausse') counts.hausse += 1
    else if (card.snapshot.trend === 'baisse') counts.baisse += 1
    else if (card.snapshot.trend === 'stable') counts.stable += 1
  }
  return counts
})

const hasComparison = computed(
  () => summary.value.hausse + summary.value.baisse + summary.value.stable > 0,
)
</script>

<template>
  <section v-if="groups.length === 0" class="flex flex-col items-start pt-8">
    <p class="font-serif text-4xl leading-tight tracking-tight text-ink">Rien dans le carnet.</p>
    <p class="mt-3 max-w-xs text-base leading-relaxed text-muted">
      Note le prix d’un produit au magasin. Au prochain passage, tu verras s’il a bougé.
    </p>
    <RouterLink
      to="/noter"
      class="btn-primary mt-8 inline-flex items-center justify-center no-underline"
    >
      Noter un prix
    </RouterLink>
  </section>

  <div v-else class="flex flex-col gap-8">
    <section v-if="hasComparison" class="grid grid-cols-3 gap-2" aria-label="Résumé du panier">
      <div class="rounded-2xl bg-sand px-3 py-3">
        <p class="font-serif text-3xl leading-none text-clay">{{ summary.hausse }}</p>
        <p class="mt-2 text-xs tracking-wide text-muted uppercase">en hausse</p>
      </div>
      <div class="rounded-2xl bg-sand px-3 py-3">
        <p class="font-serif text-3xl leading-none text-moss">{{ summary.baisse }}</p>
        <p class="mt-2 text-xs tracking-wide text-muted uppercase">en baisse</p>
      </div>
      <div class="rounded-2xl bg-sand px-3 py-3">
        <p class="font-serif text-3xl leading-none text-ink">{{ summary.stable }}</p>
        <p class="mt-2 text-xs tracking-wide text-muted uppercase">stables</p>
      </div>
    </section>

    <section v-for="group in groups" :key="group.id" class="flex flex-col gap-3">
      <h2 class="text-xs font-medium tracking-[0.18em] text-muted uppercase">
        {{ categoryLabel(group.id) }}
      </h2>
      <ul class="flex flex-col gap-3">
        <li v-for="card in group.cards" :key="card.product.id">
          <ProductCard :product="card.product" :snapshot="card.snapshot" />
        </li>
      </ul>
    </section>
  </div>
</template>
