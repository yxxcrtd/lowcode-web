<template>
  <el-cascader
    ref="cascaderRef"
    v-model="selValue"
    :options="options"
    :disabled="disabled"
    style="width: 100%"
    :props="{ multiple: multiple, emitPath: false,label:'name',value:'id' }"
    clearable
    collapse-tags
    collapse-tags-tooltip
    :filterable="true"
    @change="handleChange"
  >
  </el-cascader>
</template>

<script lang="ts" setup>
import { getLocalDirTreeInfo } from './api'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'SelectAttachmentType' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  modelText:propTypes.string.def(''),
  disabled:propTypes.bool.def(false),
  multiple: propTypes.bool.def(false),
  dirType: propTypes.string.def('0'),
  filterFileType:propTypes.array.def([])
})
const emit = defineEmits(['update:modelText','update:modelText', 'change'])
const selValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})

/**
 * 根据附件类型获取下拉值
 */
watch(() => props.dirType,() => {
  getCascaderData()
})
const options = ref([])
const getCascaderData = async () => {
  const params={
    dirType:props.dirType || '0'
  }
  const res = await getLocalDirTreeInfo(params)
  if(props.filterFileType && props.filterFileType.length && res && res.length){
    await res.forEach(node => {
      handleTreeData(node,(list) => {
        if(list.children && list.children.length && list.children.every(item => item.disabled)){
          list.disabled = true
        }
        if(!(list.children &&list.children.length) && !props.filterFileType.includes(list.id)){
          list.disabled = true
        }
      })
    })
    options.value = [...res]
  }else{
    options.value = res
  }
  
}
getCascaderData()

const handleTreeData = (list,callback) =>{
  if(list.children && list.children.length){
    list.children.forEach(item => handleTreeData(item,callback))
  }
  callback(list)
}
const cascaderRef=ref()
const handleChange=(val)=>{
  const checkedNodes=cascaderRef.value.getCheckedNodes()
  if(checkedNodes && checkedNodes.length){
    emit('update:modelText', checkedNodes[0].text)
  }
}
/** 初始化 */
onMounted(async () => {})
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
