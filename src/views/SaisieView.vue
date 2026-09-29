<script setup>
import OptionPills from '@/components/OptionPills.vue'
import { CATEGORIES, UNITS } from '@/lib/catalog'
import { formatMoney, parseAmount, parseQuantity, todayIso } from '@/lib/format'
import { useCoursesStore } from '@/stores/courses'
import { storeToRefs } from 'pinia'
import { computed, ref, useTemplateRef, watch } from 'vue'

const store = useCoursesStore()
const { entries } = storeToRefs(store)

const name = ref('')
const category = ref('frais')
const unit = ref('pièce')
const amount = ref('')
const quantity = ref('1')
const shop = ref('')
const date = ref(todayIso())
const error = ref('')
const notice = ref('')
const nameInput = useTemplateRef('nameInput')

const existing = computed(() => store.findByName(name.value))

watch(existing, (product) => {
  if (!product) return
  category.value = product.category
  unit.value = product.unit
})

const knownStores = computed(() => {
  const names = new Set(entries.value.map((entry) => entry.store).filter(Boolean))
  return [...names].sort((a, b) => a.localeCompare(b, 'fr'))
})

async function submit() {
  error.value = ''
  notice.value = ''
  const trimmed = name.value.trim()
  const parsedAmount = parseAmount(amount.value)
  const parsedQuantity = parseQuantity(quantity.value)

  if (!trimmed) {
    error.value = 'Indique le nom du produit.'
    return
  }
  if (!date.value) {
    error.value = 'Indique la date du prix.'
    return
  }
  if (parsedAmount == null) {
    error.value = 'Indique un prix valide, par exemple 1,05.'
    return
  }
  if (parsedQuantity == null) {
    error.value = 'Indique une quantité supérieure à zéro.'
    return
  }

  await store.addPrice({
    name: trimmed,
    category: category.value,
    unit: unit.value,
    amount: parsedAmount,
    quantity: parsedQuantity,
    date: date.value,
    store: shop.value,
  })

  notice.value = `${trimmed} noté à ${formatMoney(parsedAmount)}.`
  name.value = ''
  amount.value = ''
  quantity.value = '1'
  nameInput.value?.focus()
}
</script>

<template>
  <form class="flex w-full min-w-0 flex-col gap-6" @submit.prevent="submit">
    <div>
      <h2 class="font-serif text-4xl leading-none tracking-tight">Noter un prix</h2>
      <p class="mt-3 text-sm leading-relaxed text-muted">
        Un produit déjà présent garde son rayon et son unité, pour que les prix restent comparables.
      </p>
    </div>

    <p v-if="notice" class="rounded-2xl bg-moss/10 px-4 py-3 text-sm text-moss" role="status">
      {{ notice }}
    </p>
    <p v-if="error" class="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay" role="alert">
      {{ error }}
    </p>

    <label class="field">
      Produit
      <input
        ref="nameInput"
        v-model="name"
        type="text"
        name="produit"
        autocomplete="off"
        placeholder="Lait entier"
        required
      />
    </label>

    <OptionPills
      v-model="category"
      label="Rayon"
      :options="CATEGORIES"
      :disabled="Boolean(existing)"
    />
    <OptionPills v-model="unit" label="Unité" :options="UNITS" :disabled="Boolean(existing)" />
    <p v-if="existing" class="text-sm text-muted">
      Déjà dans le panier : {{ existing.name }}. L’unité ne change pas.
    </p>

    <label class="block">
      <span class="text-sm text-muted">Prix payé</span>
      <span class="mt-1 flex items-baseline gap-2 border-b border-line">
        <input
          v-model="amount"
          class="w-full min-w-0 bg-transparent py-2 font-serif text-6xl tracking-tight text-ink outline-none placeholder:text-[#c4b8a8]"
          inputmode="decimal"
          autocomplete="off"
          placeholder="0,00"
          aria-label="Prix payé en euros"
        />
        <span class="pb-2 font-serif text-2xl text-muted">€</span>
      </span>
    </label>

    <div class="grid grid-cols-2 gap-3">
      <label class="field">
        Quantité
        <input v-model="quantity" type="text" inputmode="decimal" autocomplete="off" />
      </label>
      <label class="field">
        Date
        <input v-model="date" type="date" required />
      </label>
    </div>

    <label class="field">
      Magasin
      <input
        v-model="shop"
        type="text"
        list="magasins"
        autocomplete="off"
        placeholder="Optionnel"
      />
      <datalist id="magasins">
        <option v-for="storeName in knownStores" :key="storeName" :value="storeName" />
      </datalist>
    </label>

    <button class="btn-primary" type="submit">Enregistrer</button>
  </form>
</template>
