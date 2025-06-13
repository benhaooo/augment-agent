<template>
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Features & Capabilities</h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Explore the powerful features and capabilities of this Electron Vue3 starter template
      </p>
    </div>

    <!-- IPC Communication Demo -->
    <div class="card mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Inter-Process Communication (IPC)</h2>
      <p class="text-gray-600 mb-6">
        Demonstrate secure communication between the main and renderer processes
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-medium text-gray-900 mb-3">Window Controls</h3>
          <div class="space-y-2">
            <button @click="minimizeWindow" class="btn btn-secondary w-full">
              Minimize Window
            </button>
            <button @click="maximizeWindow" class="btn btn-secondary w-full">
              Toggle Maximize
            </button>
          </div>
        </div>

        <div>
          <h3 class="font-medium text-gray-900 mb-3">System Dialogs</h3>
          <div class="space-y-2">
            <button @click="showInfoDialog" class="btn btn-primary w-full">Show Info Dialog</button>
            <button @click="showWarningDialog" class="btn btn-secondary w-full">
              Show Warning Dialog
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue 3 Composition API Demo -->
    <div class="card mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Vue 3 Composition API</h2>
      <p class="text-gray-600 mb-6">
        Interactive examples showcasing Vue 3's Composition API features
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-medium text-gray-900 mb-3">Reactive Counter</h3>
          <div class="flex items-center space-x-4">
            <button @click="decrementCounter" class="btn btn-secondary">-</button>
            <span class="text-2xl font-bold text-primary-600">{{ counter }}</span>
            <button @click="incrementCounter" class="btn btn-primary">+</button>
          </div>
          <button @click="resetCounter" class="btn btn-secondary mt-2 w-full">Reset</button>
        </div>

        <div>
          <h3 class="font-medium text-gray-900 mb-3">Computed Properties</h3>
          <div class="space-y-2">
            <p><strong>Counter × 2:</strong> {{ doubledCounter }}</p>
            <p><strong>Is Even:</strong> {{ isEven ? 'Yes' : 'No' }}</p>
            <p><strong>Status:</strong> {{ counterStatus }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reactive Form Demo -->
    <div class="card mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Reactive Forms</h2>
      <p class="text-gray-600 mb-6">Demonstrate reactive form handling with validation</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            v-model="form.name"
            type="text"
            class="input"
            :class="{ 'border-red-500': errors.name }"
            placeholder="Enter your name"
          />
          <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="input"
            :class="{ 'border-red-500': errors.email }"
            placeholder="Enter your email"
          />
          <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            v-model="form.message"
            rows="3"
            class="input"
            :class="{ 'border-red-500': errors.message }"
            placeholder="Enter your message"
          ></textarea>
          <p v-if="errors.message" class="text-red-500 text-sm mt-1">{{ errors.message }}</p>
        </div>

        <button type="submit" class="btn btn-primary w-full">Submit Form</button>
      </form>

      <div v-if="formSubmitted" class="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg">
        <h4 class="font-medium text-green-800">Form Submitted Successfully!</h4>
        <pre class="text-sm text-green-700 mt-2">{{ JSON.stringify(form, null, 2) }}</pre>
      </div>
    </div>

    <!-- Performance Monitoring -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Performance Monitoring</h2>
      <p class="text-gray-600 mb-6">
        Real-time performance metrics and component lifecycle tracking
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-primary-600">{{ renderCount }}</div>
          <div class="text-sm text-gray-600">Render Count</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary-600">{{ mountTime }}ms</div>
          <div class="text-sm text-gray-600">Mount Time</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary-600">{{ updateCount }}</div>
          <div class="text-sm text-gray-600">Updates</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'

// Counter demo
const counter = ref(0)
const doubledCounter = computed(() => counter.value * 2)
const isEven = computed(() => counter.value % 2 === 0)
const counterStatus = computed(() => {
  if (counter.value === 0) return 'Zero'
  if (counter.value > 0) return 'Positive'
  return 'Negative'
})

const incrementCounter = () => counter.value++
const decrementCounter = () => counter.value--
const resetCounter = () => (counter.value = 0)

// Form demo
const form = reactive({
  name: '',
  email: '',
  message: '',
})

const errors = reactive({
  name: '',
  email: '',
  message: '',
})

const formSubmitted = ref(false)

const validateForm = () => {
  errors.name = form.name.trim() ? '' : 'Name is required'
  errors.email = form.email.trim() ? '' : 'Email is required'
  errors.message = form.message.trim() ? '' : 'Message is required'

  if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Please enter a valid email'
  }

  return !errors.name && !errors.email && !errors.message
}

const handleSubmit = () => {
  if (validateForm()) {
    formSubmitted.value = true
    setTimeout(() => {
      formSubmitted.value = false
    }, 3000)
  }
}

// Performance monitoring
const renderCount = ref(0)
const mountTime = ref(0)
const updateCount = ref(0)

onMounted(() => {
  const startTime = performance.now()
  mountTime.value = Math.round(performance.now() - startTime)
  renderCount.value++
})

// 移除 onUpdated 钩子以避免递归更新
// onUpdated(() => {
//   updateCount.value++
// })

// IPC methods
const minimizeWindow = async () => {
  if (window.electronAPI) {
    await window.electronAPI.minimizeWindow()
  }
}

const maximizeWindow = async () => {
  if (window.electronAPI) {
    await window.electronAPI.maximizeWindow()
  }
}

const showInfoDialog = async () => {
  if (window.electronAPI) {
    await window.electronAPI.showMessageBox({
      type: 'info',
      title: 'Information',
      message: 'This is an information dialog from the main process!',
      detail: 'IPC communication is working correctly.',
    })
  }
}

const showWarningDialog = async () => {
  if (window.electronAPI) {
    await window.electronAPI.showMessageBox({
      type: 'warning',
      title: 'Warning',
      message: 'This is a warning dialog.',
      detail: 'This demonstrates different dialog types.',
    })
  }
}
</script>
