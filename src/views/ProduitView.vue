<script setup>
import PriceChart from '@/components/PriceChart.vue'
import { categoryLabel } from '@/lib/catalog'
import {
  formatDate,
  formatMoney,
  formatPercent,
  formatPriceLabel,
  formatUnitPrice,
} from '@/lib/format'
import { productSnapshot, sortedEntries, unitPrice } from '@/lib/prices'
import { useCoursesStore } from '@/stores/courses'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const store = useCoursesStore()
const { products, entriesByProduct } = storeToRefs(store)
const pendingDelete = ref('')

const product = computed(() => products.value.find((item) => item.id === route.params.id) ?? null)

const entries = computed(() =>
  product.value ? sortedEntries(entriesByProduct.value[product.value.id] ?? []) : [],
)

const snapshot = computed(() => {
  if (!product.value) return null
  return productSnapshot(product.value, entries.value, products.value, entriesByProduct.value)
})

const points = computed(() =>
  entries.value.map((entry) => ({
    label: formatDate(entry.date),
    value: unitPrice(entry.amount, entry.quantity),
  })),
)

const history = computed(() => [...entries.value].reverse())

const sentence = computed(() => {
  if (!snapshot.value?.last) return ''
  if (snapshot.value.trend === 'nouveau' || snapshot.value.delta == null) {
    return snapshot.value.trend === 'hausse'
      ? `En hausse depuis le ${formatDate(snapshot.value.previous?.date ?? snapshot.value.last.date)}`
      : 'Premier prix noté'
  }
  if (snapshot.value.trend === 'stable') {
    return `Stable depuis le ${formatDate(snapshot.value.previous.date)}`
  }
  const direction = snapshot.value.trend === 'hausse' ? 'En hausse' : 'En baisse'
  const percent = formatPercent(snapshot.value.delta).replace('+', '').replace('−', '')
  return `${direction} de ${percent} depuis le ${formatDate(snapshot.value.previous.date)}`
})

async function erase(id) {
  if (pendingDelete.value !== id) {
    pendingDelete.value = id
    return
  }
  await store.removeEntry(id)
  pendingDelete.value = ''
}

async function removeProduct() {
  if (!product.value) return
  const id = product.value.id
  await store.removeProduct(id)
  await router.push('/')
}
</script>

<template>
  <section v-if="!product" class="pt-6">
    <h2 class="font-serif text-4xl tracking-tight">Produit introuvable</h2>
    <RouterLink to="/" class="mt-6 inline-block text-sm text-moss">Retour au panier</RouterLink>
  </section>

  <article v-else-if="snapshot" class="flex flex-col gap-8">
    <header>
      <p class="text-xs font-medium tracking-[0.18em] text-muted uppercase">
        {{ categoryLabel(product.category) }}
      </p>
      <h2 class="mt-2 font-serif text-4xl leading-tight tracking-tight">{{ product.name }}</h2>
      <p v-if="snapshot.current != null" class="mt-5 font-serif text-5xl tracking-tight">
        {{ formatPriceLabel(snapshot.current, product.unit, snapshot.last.quantity) }}
      </p>
      <p
        class="mt-3 text-sm"
        :class="
          snapshot.trend === 'hausse'
            ? 'text-clay'
            : snapshot.trend === 'baisse'
              ? 'text-moss'
              : 'text-muted'
        "
      >
        {{ sentence }}
      </p>
    </header>

    <section class="rounded-3xl border border-line bg-card px-3 py-4">
      <h3 class="px-2 text-xs font-medium tracking-[0.18em] text-muted uppercase">Évolution</h3>
      <PriceChart
        v-if="points.length > 0"
        class="mt-2"
        :points="points"
        :label="`Évolution du prix de ${product.name}`"
      />
      <p v-if="points.length < 2" class="px-2 pt-2 text-sm text-muted">
        Un second prix dessinera la tendance.
      </p>
    </section>

    <section v-if="snapshot.alternative" class="rounded-3xl bg-sand px-4 py-4">
      <p class="text-xs font-medium tracking-[0.18em] text-muted uppercase">Moins cher</p>
      <p class="mt-2 text-lg font-medium">{{ snapshot.alternative.product.name }}</p>
      <p class="mt-1 text-sm text-moss">
        {{ formatUnitPrice(snapshot.alternative.unitPrice, product.unit) }} ·
        {{ formatMoney(snapshot.alternative.savings) }} de moins
      </p>
      <RouterLink
        :to="`/produit/${snapshot.alternative.product.id}`"
        class="mt-3 inline-block text-sm text-ink underline decoration-line underline-offset-4"
      >
        Voir ce produit
      </RouterLink>
    </section>

    <section>
      <h3 class="text-xs font-medium tracking-[0.18em] text-muted uppercase">Relevés</h3>
      <ul class="mt-3 flex flex-col">
        <li
          v-for="entry in history"
          :key="entry.id"
          class="flex items-center justify-between gap-3 border-b border-line py-3"
        >
          <div>
            <p class="text-sm text-ink">
              {{ formatDate(entry.date) }}
              <span v-if="entry.store" class="text-muted">· {{ entry.store }}</span>
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ formatMoney(entry.amount) }}
              · {{ entry.quantity }} {{ product.unit }}
            </p>
          </div>
          <button class="btn-quiet" type="button" @click="erase(entry.id)">
            {{ pendingDelete === entry.id ? 'Confirmer' : 'Effacer' }}
          </button>
        </li>
      </ul>
    </section>

    <button class="btn-quiet self-start" type="button" @click="removeProduct">
      Retirer du panier
    </button>
  </article>
</template>
