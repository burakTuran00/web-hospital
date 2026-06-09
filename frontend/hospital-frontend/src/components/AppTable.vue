<template>
  <q-table
    :columns="computedColumns"
    :loading="loading"
    :row-key="rowKey"
    :rows="rows"
    :rows-per-page-options="[10, 25, 50]" :style="onRowClick ? 'cursor:pointer' : ''"
    bordered
    flat
    no-data-label="Kayıt yok"
    @row-click="handleRowClick"
  >
    <template v-for="col in parentSlotNames" :key="col" #[`body-cell-${col}`]="props">
      <slot :name="`cell-${col}`" v-bind="props"/>
    </template>

    <template #body-cell-actions="props">
      <q-td :props="props" auto-width>
        <slot name="actions" v-bind="props">
          <q-btn dense flat icon="edit" round size="sm" @click.stop="$emit('edit', props.row)">
            <q-tooltip>Düzenle</q-tooltip>
          </q-btn>
          <q-btn color="negative" dense flat icon="delete" round size="sm" @click.stop="$emit('delete', props.row)">
            <q-tooltip>Sil</q-tooltip>
          </q-btn>
        </slot>
      </q-td>
    </template>

    <template #loading>
      <q-inner-loading color="primary" showing/>
    </template>
  </q-table>
</template>

<script setup>
import {computed, useSlots} from 'vue'

const props = defineProps({
  rows: {type: Array, default: () => []},
  columns: {type: Array, default: () => []},
  loading: {type: Boolean, default: false},
  rowKey: {type: String, default: 'id'},
  onRowClick: {type: Function, default: null},
  showActions: {type: Boolean, default: true}
})

defineEmits(['edit', 'delete'])

const slots = useSlots()

const handleRowClick = (evt, row) => {
  if (props.onRowClick) props.onRowClick(row)
}

const parentSlotNames = computed(() =>
  Object.keys(slots)
    .filter(name => name.startsWith('cell-'))
    .map(name => name.replace('cell-', ''))
)

const computedColumns = computed(() => {
  if (!props.showActions) return props.columns
  const hasActions = props.columns.some(c => c.name === 'actions')
  if (hasActions) return props.columns
  return [...props.columns, {name: 'actions', label: '', field: 'actions', align: 'right'}]
})
</script>
