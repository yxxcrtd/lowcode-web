<script setup lang="ts">
import type { CcNode} from '../nodes/type'
import type { Ref } from 'vue'
import type { Field } from '../Components/Render/type'
import type { FormProperty } from '../nodes/type'
import AssigneePanel from './AssigneePanel.vue'

const { fields } = inject<{ fields: Ref<Field[]> }>('flowDesign', { fields: ref([]) })
const { isOutProcess } = inject<{
  isOutProcess?: Ref<boolean>
}>('flowDesign', { isOutProcess: ref(false) })
const props = defineProps<{
  activeData: CcNode
}>()

const emit = defineEmits(['update:activeData'])
const curActiveData=computed({
  get: () => {
    return props.activeData
  },
  set: (val: CcNode) => {
    emit('update:activeData', val)
  }
})
const activeName = ref('properties')
const allReadonly = computed({
  get() {
    return props.activeData.formProperties.every((e) => e.readonly)
  },
  set(val) {
    props.activeData.formProperties.forEach((e) => (e.readonly = val))
    if (val) {
      allHidden.value = false
    }
  }
})
const allHidden = computed({
  get() {
    return props.activeData.formProperties.every((e) => e.hidden)
  },
  set(val) {
    props.activeData.formProperties.forEach((e) => (e.hidden = val))
    if (val) {
      allReadonly.value = false
    }
  }
})

const changeReadonly = (row: FormProperty) => {
  if(row.isGroup){
    row.children.forEach(childRow => {
      childRow.readonly=row.readonly
      if (childRow.readonly) {
        childRow.hidden = false
      }
    })
  }else{
    if (row.readonly) {
      row.hidden = false
    }
  }
}
const changeHidden = (row: FormProperty) => {
  if(row.isGroup){
    row.children.forEach(childRow => {
      childRow.hidden=row.hidden
      if (childRow.hidden) {
        childRow.readonly = false
      }
    })
  }else{
    if (row.hidden) {
      row.readonly = false
    }
  }
}

watchEffect(() => {
  const formProperties = props.activeData.formProperties
  curActiveData.value.formProperties = fields.value.map((field) => ({
    id: field.id,
    fieldId: field.id,
    name: field.label,
    groupCode:field.groupCode,
    groupName:field.groupName,
    readonly: field.readonly || false,
    hidden: field.hidden,
    required: field.required || false,
    fieldAlias:field.fieldAlias
  }))
  props.activeData.formProperties.forEach((item) => {
    const properties = formProperties.find((f) => f.id === item.id)
    if (properties) {
      item.readonly = properties.readonly
      item.hidden = properties.hidden
      item.required = properties.required
      item.fieldAlias=properties.fieldAlias
    }
  })
})
const formItemData=computed(()=>{
  const groupList=props.activeData.formProperties.reduce((pre,cur)=>{
    if(!pre.find(v=>v.groupCode===cur.groupCode)){
      pre.push({
        id:cur.groupCode,
        groupCode:cur.groupCode,
        isGroup:true,
        name:cur.groupName,
      })
    }
    return pre
  },[])

  const tableData=groupList.map(item=>{
    item.children=props.activeData.formProperties.filter(formItem=>formItem.groupCode==item.groupCode)
    return item
  })
  return tableData
})

const setRowClass=(data)=>{
  if(data.row.isGroup){
    return 'group-item-row'
  }else{
    return 'form-item-row'
  }
}
</script>

<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="抄送人" name="properties">
      <el-form label-position="top" label-width="90px">
        <el-form-item prop="outProcessNodeId" label="外部流程节点ID" v-if="isOutProcess">
          <el-input
            v-model="curActiveData.outProcessNodeId"
            :maxlength="255"
            clearable
            placeholder="请输入外部流程ID,多个逗号分隔"
          />
        </el-form-item>
        <AssigneePanel :active-data="activeData" :fields="fields" type="抄送" />
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="表单权限" name="formPermissions">
      <div class="form-permissions-table-content">
        <el-table :data="formItemData" height="100%" row-key="id" default-expand-all :row-class-name="setRowClass">
          <el-table-column width="260" prop="name" label="字段" />
          <el-table-column prop="readonly">
            <template #header>
              <el-checkbox v-model="allReadonly" label="只读" />
            </template>
            <template #default="{ row }">
              <el-checkbox v-model="row.readonly" @change="changeReadonly(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="hidden">
            <template #header>
              <el-checkbox v-model="allHidden" label="隐藏" />
            </template>
            <template #default="{ row }">
              <el-checkbox v-model="row.hidden" @change="changeHidden(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="fieldAlias" label="字段别名" width="200">
            <template #default="{ row }">
              <el-input v-if="!row.isGroup" v-model="row.fieldAlias" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped lang="scss">
:deep(.el-tabs__content){
  padding: 0 8px;
}
:deep(.el-form-item__label){
  font-size: 12px;
  font-weight: 600;
}
:deep(.el-form-item--label-top) {
  display: block;
  padding-bottom: 10px;
  border-bottom: 1px solid #efefef;
}
.form-permissions-table-content{
  height: calc(100vh - 165px);
}
:deep(.group-item-row){
  .el-table__cell{
    background: #e7f3ff !important;
  }
}
</style>
