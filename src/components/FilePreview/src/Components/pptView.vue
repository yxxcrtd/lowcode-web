<template>
  <div v-loading="loading">
<!--    <VueOfficePptx :src="pptSrc" @rendered="renderedHandler" @error="errorHandler" />-->
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { isURL } from '@/utils'

const loading=ref(false)
let pptSrc = ref('')
const preview = (file) => {
  loading.value=true
  if (isURL(file)) {
    pptSrc = ref(file)
  } else {
    let reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = function () {
      pptSrc.value = reader.result
    }
  }
}

defineExpose({ preview })

const renderedHandler = () => {
  loading.value = false
}
const errorHandler = () => {
  loading.value = false
}
</script>

<style scoped lang="scss">
:deep(.docx-wrapper) {
  background: rgb(238, 238, 244);
}
</style>
