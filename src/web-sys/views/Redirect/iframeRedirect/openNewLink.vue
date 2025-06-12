<script setup lang="ts">
import {ref} from 'vue'
import {useRoute} from 'vue-router'
const route = useRoute()
const src = ref('')
src.value = (route.query?.url) as string || ''
</script>

<template>
<div>
  <i-frame :src="src"></i-frame>
</div>
</template>

<style scoped lang="scss">

</style>
