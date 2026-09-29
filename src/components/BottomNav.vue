<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const items = [
  { name: 'panier', to: '/', label: 'Panier' },
  { name: 'noter', to: '/noter', label: 'Noter' },
]

const current = computed(() => (route.name === 'produit' ? 'panier' : route.name))
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center">
    <nav
      class="pointer-events-auto flex w-full max-w-lg gap-2 border-t border-line bg-paper/95 px-5 pt-3 backdrop-blur-md"
      style="padding-bottom: calc(0.85rem + env(safe-area-inset-bottom))"
      aria-label="Sections"
    >
      <RouterLink
        v-for="item in items"
        :key="item.name"
        :to="item.to"
        class="flex h-12 flex-1 items-center justify-center rounded-full text-sm font-medium"
        :class="
          current === item.name ? 'bg-ink text-paper' : 'text-muted hover:bg-sand hover:text-ink'
        "
        :aria-current="current === item.name ? 'page' : undefined"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </div>
</template>
