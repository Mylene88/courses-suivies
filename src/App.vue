<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTitle } from '@vueuse/core'
import { storeToRefs } from 'pinia'

import BottomNav from '@/components/BottomNav.vue'
import { useCoursesStore } from '@/stores/courses'

const route = useRoute()
const store = useCoursesStore()
const { ready, error } = storeToRefs(store)

const title = computed(() => {
  const page = typeof route.meta.title === 'string' ? route.meta.title : 'Courses suivies'
  return `${page} · Courses suivies`
})

useTitle(title)
store.hydrate()
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-lg min-w-0 flex-col overflow-x-clip">
    <header class="px-5 pt-7 pb-2">
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="text-[0.7rem] font-medium tracking-[0.22em] text-muted uppercase">Carnet</p>
          <RouterLink
            to="/"
            class="font-serif text-[2.15rem] leading-none font-medium tracking-[-0.03em] text-ink"
          >
            Courses
          </RouterLink>
        </div>
        <p class="pb-1 text-sm text-muted">prix du panier</p>
      </div>
      <div class="mt-4 h-px bg-line"></div>
    </header>

    <main class="flex-1 px-5 pt-5 pb-32">
      <p v-if="error" class="rounded-3xl bg-sand px-4 py-4 text-sm text-clay">{{ error }}</p>
      <p v-else-if="!ready" class="text-sm text-muted">Ouverture du carnet…</p>
      <RouterView v-else />
    </main>

    <BottomNav />
  </div>
</template>
