<template>
  <component v-if="slotComponents" :is="slotComponents" v-bind="$attrs"></component>
</template>
<script setup lang="ts">
import {ref} from 'vue'
import {propTypes} from "@/utils/propTypes";

const props=defineProps({
  slotPath:propTypes.string
})
const slotComponents=ref(null)

let slotModules = import.meta.glob('@/comRenderPlugins/**/**/*.vue')
const templateModulePath = '/src/comRenderPlugins'

const loadSlot=async ()=>{
  const templatePath=templateModulePath+props.slotPath
  if(props.slotPath && slotModules && slotModules[templatePath]){
    try{
      const renderComponent =await slotModules[templatePath]()
      slotComponents.value=renderComponent.default
    }catch(e){
      console.error(e)
    }
  }
}
onMounted(async () => {
  loadSlot()
})
</script>
<style scoped lang="scss">
</style>
