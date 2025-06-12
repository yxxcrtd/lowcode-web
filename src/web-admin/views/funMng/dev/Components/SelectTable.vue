<template>
  <el-tree-select
    v-model="selectTableId"
    default-expand-all
    :data="dataList"
    @node-click="nodeClick"
  />
</template>

<script lang="ts" setup>
import {dataSourceList, getTablePage} from "@/web-admin/views/funMng/tableMng/api";
import {propTypes} from "@/utils/propTypes";

defineOptions({ name: 'SelectTable' })

const props = defineProps({
  modelValue: propTypes.string.def('')
})
const emit = defineEmits(['update:modelValue','change'])
const selectTableId = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})

const dataList = ref<Option[]>([])
const getTableList = async () => {
  const params={
    page: 1,
    pageSize: 1000,
    status: true
  }
  const datasourceRes = await dataSourceList();
  const tableRes:any[] = await getTablePage(params)
  console.log(datasourceRes,tableRes.list)
  dataList.value=datasourceRes.map(item=>{
    item.label=item.name;
    item.value = item.id;
    item.children = tableRes.list.filter(tableItem => tableItem.datasourceId===item.id).map(tableItem=>{
      return {
        label:tableItem.tableComment,
        value:tableItem.id,
        ...tableItem
      }
    })
    return item;
  })
}
getTableList()
/** 初始化 */
onMounted(async () => {

})
const nodeClick=(data,node)=>{
  console.log(data,node)
  if(node.isLeaf){
    emit("change",data)
  }
}
</script>
