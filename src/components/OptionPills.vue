<script setup>
defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <fieldset class="min-w-0 border-0 p-0">
    <legend class="mb-2 text-sm text-muted">{{ label }}</legend>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        class="h-10 rounded-full border px-4 text-sm disabled:cursor-not-allowed disabled:opacity-70"
        :class="
          modelValue === option.id
            ? 'border-ink bg-ink text-paper'
            : 'border-line bg-card text-ink hover:border-moss'
        "
        :disabled="disabled"
        :aria-pressed="modelValue === option.id"
        @click="$emit('update:modelValue', option.id)"
      >
        {{ option.label }}
      </button>
    </div>
  </fieldset>
</template>
