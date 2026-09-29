import { describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import { routes } from '../router'

describe('App', () => {
  it('affiche le carnet vide', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain('Courses')
    expect(wrapper.text()).toContain('Rien dans le carnet.')
  })
})
