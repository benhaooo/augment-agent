import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { routes } from './router'
import './style.css'

// Create router instance
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Create Pinia instance
const pinia = createPinia()

// Create and mount the Vue app
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
