<template>
  <div class="component-container">
    <ace-select-tabs-table
      :columns="columns"
      :load-tab-list="getComponentTabs"
      :sourceUrl="sourceUrl"
      :showLabel="showLabel"
      :tablePageConfig="{pageSize:20}"
      :multiple="false"
      labelKey="componentName"
      valueKey="componentCode"
      :query-config="{ tabKey: 'groupId', searchKey: 'componentName' }"
      v-model="curComId"
      @change="selectTabsChange"
    />
    <el-button class="operate-btn" :icon="Setting" @click="openComponentDialog" :class="propsList ? 'green-text' : ''" title="配置属性"/>
  </div>
  <ComponentPropDialog ref="componentPropDialogRef" :dict="dict" @success="saveComponentAttribute"/>
</template>

<script lang="ts" setup>
import {propTypes} from "@/utils/propTypes";
import {Setting} from "@element-plus/icons-vue"
import ComponentPropDialog from "./ComponentPropDialog.vue";
import {ref} from "vue";
import {getTree} from "@/components-yt/biz/SelectComponent/api";

defineOptions({ name: 'SelectComponent' })
const message = useMessage() // 消息弹窗
const props = defineProps({
  pageId: propTypes.number,
  priority: propTypes.number,
  modelValue: propTypes.string,
  showLabel:propTypes.string,
  propsList: propTypes.array,
  dict:propTypes.string,
})
const emit = defineEmits(['update:modelValue','update:propsList','change','update:showLabel'])
const currentConfig = ref(props.modelValue);
const _propsList = ref(props.propsList);

const curComId = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    // 更新父组件的值
    emit('update:modelValue', val);
    // 如果新值与当前值不同，移除 green-text 类
    if (val !== currentConfig.value) {
      emit('update:propsList', null); // 更新 propsList
    } else {
      // 保持当前配置
      emit('update:propsList',_propsList.value ); // 假设保持当前配置的逻辑
    }
  }
})
const showLabel = computed({
  get: () => {
    return props.showLabel
  },
  set: (val: string) => {
    emit('update:showLabel', val)
  }
})
const selectTabsChange=(val,selectObj)=>{
  console.log(val,selectObj)
  showLabel.value=selectObj.componentName
}
/** 表格列配置 */
const columns = ref([
  {
    title: '组件名称',
    align: 'left',
    width: '180',
    field: 'componentName'
  },
  {
    title: '组件编码',
    align: 'left',
    width: '240',
    field: 'componentCode'
  },
  {
    title: '说明',
    align: 'center',
    field: 'remark'
  }
])

/** 组件列表接口地址 */
const sourceUrl = ref('/cfg/component-table/page')
/** 分组标签列表 */
/**
 * 获取组件分组数据
 * @description 获取组件分组树形数据并转换为标签页格式
 */
const getComponentTabs = async () => {
  const res = await getTree()
  res.sort((a,b)=>{
    return a.numSort-b.numSort
  })
  return res.map((item: TreeItem) => ({
    label: item.groupName,
    value: item.id,
    params:{
      groupId:item.id
    }
  }))
}

const componentPropDialogRef = ref()
const openComponentDialog = () => {
  if(curComId.value){
    componentPropDialogRef.value.open(curComId.value, props.propsList, props.pageId, props.priority);
  }else{
    message.warning("请选择组件")
  }
}

const saveComponentAttribute =  (val) => {
  emit('update:propsList', val)

}
/** 初始化 */
onMounted(async () => {
})
</script>
<style lang="scss" scoped>
.component-container{
  display: flex;
  .operate-btn{
    margin-left: 4px;
  }
}
</style>
