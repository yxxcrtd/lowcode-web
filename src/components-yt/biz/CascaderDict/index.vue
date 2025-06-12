<template>
  <div id="cascaderKey" style="width:100%;">
    <el-cascader
      ref="cascaderRef"
      v-model="selValue"
      :options="options"
      :disabled="disabled"
      style="width: 100%"
      :props="propsData"
      clearable
      collapse-tags
      collapse-tags-tooltip
      :placement="placement"
      @change="handleChange"
      @visible-change="handleVisible"
    >
    </el-cascader>
  </div>
</template>

<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import request from "@/config/axios";
import { useElementBounding } from '@vueuse/core'

defineOptions({ name: 'CascaderDict' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  modelText:propTypes.string.def(''),
  disabled:propTypes.bool.def(false),
  multiple: propTypes.bool.def(false),
  treeType: propTypes.string,
  labelKey:propTypes.string.def('nodeText'),
  valueKey:propTypes.string.def('nodeCode'),
  // 选择任意一级选项
  checkStrictly:propTypes.bool.def(false),
})
const emit = defineEmits(['update:modelValue','update:modelText', 'change'])
const selValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
    if(!val){
      emit('change',val,null)
    }
  }
})
const placement=ref('bottom-start')
const propsData={
  multiple: props.multiple, 
  emitPath: false,
  label:props.labelKey,
  value:props.valueKey,
  checkStrictly:props.checkStrictly
}
const options = ref([])
const getCascaderData = async () => {
  const params={
    treeType: props.treeType,
  }
  const res = await getTreeData(params)
  options.value = res
}

const getTreeData = async (data: any) => {
  return await request.post({ url: '/ibps/general/commTreeData/listUse', data })
}
getCascaderData()

const cascaderRef=ref()
const handleChange=(val)=>{
  const checkedNodes=cascaderRef.value.getCheckedNodes()
  if(checkedNodes && checkedNodes.length){
    emit('update:modelText', checkedNodes[0].text)
    emit('change',val,checkedNodes[0])
  }
}
const handleVisible=()=>{
  const viewportWidth = document.documentElement.clientWidth;
  const position=document.getElementById('cascaderKey').getBoundingClientRect();
  //console.log('vvvvv',viewportWidth,position.left)
  if((viewportWidth-position.left)<200){
    placement.value='left'
  }
}

/** 初始化 */
onMounted(async () => {
})
</script>
<style lang="scss" scoped>
.node-text {
  width: 300px;
  display: flex;
  justify-content: space-between;
  & > span:first-child {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 13px 0 0;
  }
  & > span:last-child {
    width: 100px;
    color: #a9a8a8;
  }
  .node-field-text {
    font-size: 12px;
  }
}
.table-name-warning{
  display: flex;
  align-items: center;
  .table-where-icon{
    margin-right: 6px;
  }
}
</style>
