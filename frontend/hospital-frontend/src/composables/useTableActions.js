import {useQuasar} from 'quasar'

export function useTableActions(store, options = {}) {
  const $q = useQuasar()

  const notify = (type, message) =>
    $q.notify({type, message, position: 'top-right'})

  const handleSave = async ({editItem, form, dialog, saving}) => {
    saving.value = true
    try {
      if (editItem.value) {
        await store.update(editItem.value.id, form.value)
        notify('positive', options.updateMsg || 'Güncellendi.')
      } else {
        await store.create(form.value)
        notify('positive', options.createMsg || 'Eklendi.')
      }
      dialog.value = false
    } catch (err) {
      notify('negative', err.response?.data?.message || 'Hata.')
    } finally {
      saving.value = false
    }
  }

  const handleDelete = async (item, {label, onSuccess} = {}) => {
    const name = label ? label(item) : item.name || 'Bu kayıt'
    $q.dialog({
      title: 'Sil',
      message: `"${name}" silinecek. Emin misiniz?`,
      cancel: {label: 'Hayır', flat: true},
      ok: {label: 'Evet', flat: true, color: 'negative'}
    }).onOk(async () => {
      try {
        await store.delete(item.id)
        notify('positive', options.deleteMsg || 'Silindi.')
        onSuccess?.()
      } catch (err) {
        notify('negative', err.response?.data?.message || 'Silinemedi.')
      }
    })
  }

  return {handleSave, handleDelete}
}
