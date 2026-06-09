<template>
  <div class="row q-gutter-md q-mb-md items-end">
    <div v-for="filter in filters" :key="filter.key">
      <div class="text-caption text-grey-7 q-mb-xs">{{ filter.label }}</div>
      <q-input
        v-if="filter.type === 'search'"
        :model-value="modelValue[filter.key]"
        :placeholder="filter.placeholder || 'Ara...'" :style="`width:${filter.width || '220px'}`" clearable
        dense
        outlined
        @update:model-value="val => emit('update:modelValue', { ...modelValue, [filter.key]: val })"
      >
        <template #prepend>
          <q-icon name="search" size="sm"/>
        </template>
      </q-input>
      <q-select
        v-else-if="filter.type === 'select'"
        :model-value="modelValue[filter.key]"
        :options="filter.options"
        :placeholder="filter.placeholder || 'Tümü'" :style="`width:${filter.width || '150px'}`" clearable
        dense
        emit-value
        map-options outlined
        @update:model-value="val => emit('update:modelValue', { ...modelValue, [filter.key]: val })"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  filters: {type: Array, default: () => []},
  modelValue: {type: Object, default: () => ({})}
})

const emit = defineEmits(['update:modelValue'])
</script>
