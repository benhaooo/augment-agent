<script setup lang="ts">
interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    class="toggle-switch"
    :class="modelValue ? 'toggle-switch-enabled' : 'toggle-switch-disabled'"
    role="switch"
    :aria-checked="modelValue"
    @click="toggle"
  >
    <span class="toggle-switch-thumb" :class="modelValue ? 'translate-x-6' : 'translate-x-1'" />
  </button>
</template>
