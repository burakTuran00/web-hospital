<template>
  <q-dialog v-model="model" persistent>
    <q-card :style="`width:${width}; max-width:95vw`">

      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator/>

      <q-card-section class="scroll" style="max-height:65vh">
        <slot/>
      </q-card-section>

      <q-separator/>

      <q-card-actions align="right">
        <q-btn flat label="İptal" @click="model = false"/>
        <q-btn :loading="loading" color="primary" flat label="Kaydet" @click="$emit('save')"/>
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script setup>
const model = defineModel()

defineProps({
  title: {type: String, default: ''},
  loading: {type: Boolean, default: false},
  width: {type: String, default: '560px'}
})

defineEmits(['save'])
</script>
