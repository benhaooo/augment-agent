<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon: string
}

defineProps<Props>()
</script>

<template>
  <div class="feature-card">
    <div class="flex items-start space-x-4">
      <div class="flex-shrink-0">
        <div
          class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center transition-colors duration-200"
        >
          <svg
            class="w-6 h-6 text-primary-600 dark:text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
          </svg>
        </div>
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {{ title }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>
