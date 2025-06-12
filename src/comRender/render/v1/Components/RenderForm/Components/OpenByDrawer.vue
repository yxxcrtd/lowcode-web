<script setup lang="ts">
import {ref} from 'vue'

const drawer = ref(false)
const url = ref('')
const handleClose = () => {
  drawer.value = false
}
const openDrawer = (src:string) => {
  url.value = src
  drawer.value = true
}
defineExpose({openDrawer})
</script>

<template>
  <div>
    <el-drawer
      v-model="drawer"
      direction="rtl"
      @close="handleClose"
    >
      <i-frame :src="url"></i-frame>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">

</style>
