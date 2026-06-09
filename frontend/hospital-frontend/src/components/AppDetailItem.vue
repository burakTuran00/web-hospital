<template>
  <q-item>
    <q-item-section>
      <q-item-label caption>{{ label }}</q-item-label>
      <slot>
        <q-item-label>{{ value || '-' }}</q-item-label>
      </slot>
    </q-item-section>
  </q-item>
</template>

<script setup>
defineProps({
  label: {type: String, default: ''},
  value: {type: [String, Number], default: null}
})
</script>
