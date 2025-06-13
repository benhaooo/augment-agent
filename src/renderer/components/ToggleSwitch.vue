<template>
  <button
    @click="toggle"
    class="toggle-switch"
    :class="modelValue ? 'toggle-switch-enabled' : 'toggle-switch-disabled'"
    role="switch"
    :aria-checked="modelValue"
  >
    <span class="toggle-switch-thumb" :class="modelValue ? 'translate-x-6' : 'translate-x-1'" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>
