import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@fontsource-variable/fraunces'
import '@fontsource-variable/outfit'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
