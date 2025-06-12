<template>
  <div class="group-tips-content" v-if="showTips">
    <el-icon><WarningFilled /></el-icon>
    <slot></slot>
    {{ name?computedProperties[name]:'' }}
  </div>
</template>
<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import {WarningFilled} from '@element-plus/icons-vue'
import {replaceMethodField} from "@/comRender/utils";
defineOptions({ name: 'GroupTipsContent' })
const props = defineProps({
  renderFormData: propTypes.object,
  groupTips: propTypes.string,
  name: propTypes.string,
  instance:propTypes.object,
  formLayouts:propTypes.object
})
// 动态创建的计算属性
const computedProperties = reactive({})

const showTips = computed(() => {
  return props.groupTips.indexOf('function') === -1 || computedProperties[props.name]
})

// 动态创建计算属性的函数
const createComputedProperties = () => {
  computedProperties[props.name] = computed(() => {
    console.log('aaaa');
    if(props.groupTips.indexOf('function') === -1){
      return props.groupTips
    }
    const customMethodScript = replaceMethodField(props.groupTips,props.formLayouts.pageListConfigs,props.instance);
    try{
      const customFunc=new Function(customMethodScript)
      if(typeof customFunc !== 'function') return props.groupTips
      //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
      return customFunc()(props.instance,props.renderFormData)
    } catch (e){
      console.error('eventInfo.script',customMethodScript)
      console.error('自定义方法执行异常:',e)
    }
    return props.groupTips
  })
}
onMounted(async () => {
  if(props.name){
    //执行mounted阶段的自定义事件
    createComputedProperties()
  }
})
</script>
<style scoped lang="scss"></style>
