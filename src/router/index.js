import { createRouter, createWebHistory } from 'vue-router'

/** @type {import('vue-router').RouteRecordRaw[]} */
export const routes = [
  {
    path: '/',
    name: 'panier',
    component: () => import('@/views/PanierView.vue'),
    meta: { title: 'Panier' },
  },
  {
    path: '/noter',
    name: 'noter',
    component: () => import('@/views/SaisieView.vue'),
    meta: { title: 'Noter un prix' },
  },
  {
    path: '/produit/:id',
    name: 'produit',
    component: () => import('@/views/ProduitView.vue'),
    meta: { title: 'Produit' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
