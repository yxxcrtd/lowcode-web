<script setup lang="ts">
import {ref} from 'vue'

const dialog = ref(false)
const url = ref('')
const handleClose = () => {
  dialog.value = false
}
const openDialog = (src:string) => {
  url.value = src
  dialog.value = true
}
defineExpose({openDialog})
</script>

<template>
  <div>
    <el-dialog
      v-model="dialog"
      @close="handleClose"
    >
      <i-frame :src="url"></i-frame>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">

</style>
