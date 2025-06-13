<template>
  <span v-if="exists !== undefined"
        :class="[
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          exists
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        ]">
    <span :class="[
      'w-1.5 h-1.5 rounded-full mr-1.5',
      exists ? 'bg-green-400' : 'bg-red-400'
    ]"></span>
    {{ exists ? '存在' : '不存在' }}
  </span>
  <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
    <span class="w-1.5 h-1.5 rounded-full mr-1.5 bg-gray-400"></span>
    未知
  </span>
</template>

<script setup lang="ts">
interface Props {
  exists?: boolean
}

defineProps<Props>()
</script>
