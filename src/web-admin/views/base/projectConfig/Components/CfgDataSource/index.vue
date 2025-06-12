<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="基础配置" name="base">
      <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto" class="form-content" status-icon>
        <div class="content">
          <span class="subtitle">表</span>
          <el-col :span="12">
            <el-form-item label="表名前缀" prop="table_name_prefix">
              <el-input v-model="formData.table_name_prefix" placeholder="请设置表名前缀" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="表名规范" prop="table_name_rule">
              <el-input v-model="formData.table_name_rule" type="textarea" :rows="2" placeholder="请设置表名规范，正则格式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规范提示语" prop="table_name_rule_tips">
              <el-input v-model="formData.table_name_rule_tips" placeholder="请输入规范提示语" />
            </el-form-item>
          </el-col>
          <span class="subtitle">字段</span>
          <el-col :span="12">
            <el-form-item label="字段名前缀" prop="field_name_prefix">
              <el-input v-model="formData.field_name_prefix" placeholder="请设置字段名前缀" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字段名规范" prop="field_name_rule">
              <el-input v-model="formData.field_name_rule" type="textarea" :rows="2" placeholder="请设置字段名规范，正则格式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规范提示语" prop="field_name_rule_tips">
              <el-input v-model="formData.field_name_rule_tips" placeholder="请输入规范提示语" />
            </el-form-item>
          </el-col>
          <span class="subtitle">索引</span>
          <el-col :span="12">
            <el-form-item label="索引名前缀" prop="index_name_prefix">
              <el-input v-model="formData.index_name_prefix" placeholder="请设置索引名前缀" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="索引名规范" prop="index_name_rule">
              <el-input v-model="formData.index_name_rule" type="textarea" :rows="2" placeholder="请设置索引名规范，正则格式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规范提示语" prop="index_name_rule_tips">
              <el-input v-model="formData.index_name_rule_tips" placeholder="请输入规范提示语" />
            </el-form-item>
          </el-col>
        </div>
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="系统字段配置" name="second">
      <div class="tab-content">
        <div class="btn">
          <el-button type="primary" @click="openFieldDialog('create')">新增系统字段</el-button>
        </div>
        <JVxeTable ref="sysFieldVxeTable" :columns="sysFieldColumns" :row-height="58" height="auto" :data-fun="getSysFieldData">
          <template #action_default="{ row }">
            <div class="table-action">
              <el-link type="primary" @click="openFieldDialog('edit', row)">编辑</el-link>
              <el-divider direction="vertical" />
              <el-link type="primary" @click="handleDelField(row.id)">删除</el-link>
            </div>
          </template>
        </JVxeTable>
        <EditFielldDialog ref="editFieldDialogRef" @success="sysFieldSuccess"/>
      </div>
    </el-tab-pane>
    <el-tab-pane label="字段类型配置" name="third">
      <div class="tab-content">
        <div class="btn">
          <el-button type="primary" @click="openFieldTypeDialog('create')">新增字段类型</el-button>
        </div>
        <JVxeTable ref="fieldTypeVxeTable" :columns="fieldTypeColumns" :row-height="58" height="auto"  :data-fun="getDataDomainPageData">
          <template #action_default="{ row }">
            <div class="table-action">
              <el-link type="primary" @click="openFieldTypeDialog('edit', row)">编辑</el-link>
              <el-divider direction="vertical" />
              <el-link type="primary" @click="handleDelFieldType(row.id)">删除</el-link>
            </div>
          </template>
        </JVxeTable>
        <EditFieldTypeDialog ref="editFieldTypeDialogRef" @success="fieldTypeSuccess"/> </div
      ></el-tab-pane>
  </el-tabs>
  <div class="form-btn" v-if="activeName==='base'">
    <el-button type="primary" @click="submitForm"> 保存 </el-button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { fieldTypeColumns, sysFieldColumns } from '../../data'
import EditFielldDialog from './Components/EditFieldDialog.vue'
import EditFieldTypeDialog from './Components/EditFieldTypeDialog.vue'
import {getSysFieldPage,getDataDomainPage,deleteSysField,deleteDataDomain,getSysConfigList,saveConfig} from "../../api";
import {cloneDeep} from "lodash-es";

const message = useMessage() // 消息弹窗
const configGroupId='Cfg_Database'
const activeName = ref('base')
const formData = ref({})
const ruleFormRef = ref()
const configData=ref([])

const rules = reactive({
})

const param={
  category:configGroupId
}
const baseForm = [
  {
    category:'Cfg_Database',
    key: 'table_name_prefix',
    name: '表名前缀',
    value:null,
    visible:true
  },
  {
    category:'Cfg_Database',
    key: 'table_name_rule',
    name: '表名规范',
    value:null,
    visible:true
  },
  {
    category:'Cfg_Database',
    key: 'table_name_rule_tips',
    name: '规范提示语',
    value:null,
    visible:true
  },
  {
    category:'Cfg_Database',
    key: 'field_name_prefix',
    name: '字段名前缀',
    value:null,
    visible:true
  },
  {
    category:'Cfg_Database',
    key: 'field_name_rule',
    name: '字段名规范',
    value:null,
    visible:true
  },
  {
    category:'Cfg_Database',
    key: 'field_name_rule_tips',
    name: '规范提示语',
    value:null,
    visible:true
  },
  {
    category:'Cfg_Database',
    key: 'index_name_prefix',
    name: '索引名前缀',
    value:null,
    visible:true
  },
  {
    category:'Cfg_Database',
    key: 'index_name_rule',
    name: '索引名规范',
    value:null,
    visible:true
  },
  {
    category:'Cfg_Database',
    key: 'index_name_rule_tips',
    name: '规范提示语',
    value:null,
    visible:true
  },
]
getSysConfigList(param).then(res=>{
  configData.value=res
  res.forEach(item=>{
    formData.value[item.key]=item.value
  })
})
const submitForm=async ()=>{
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      const params = baseForm.map(item => ({
        ...item,
        value:formData.value[item.key]
      })).filter(item => ![null,undefined].includes(item.value))
      await saveConfig(params)
      message.success('保存成功')
      // getData(type)
    } else {
      console.log('error submit!')
    }
  })
}


const getSysFieldData = (pageParam)=>{
  return getSysFieldPage(pageParam)
}

/**
 * 新增、编辑表弹框
 */
const editFieldDialogRef = ref()
const openFieldDialog = (type: string, row?) => {
  editFieldDialogRef.value.open(type, cloneDeep(row))
}
/**
 * 删除
 * @param id
 */
const sysFieldVxeTable=ref()
const handleDelField = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await deleteSysField(id)
    message.success('删除成功')
    // 刷新列表
    sysFieldVxeTable.value.refresh()
  } catch {}
}
const sysFieldSuccess=()=>{
  sysFieldVxeTable.value.refresh()
}

const fieldTypeVxeTable=ref()
const getDataDomainPageData = (pageParam)=>{
  return getDataDomainPage(pageParam)
}
/**
 * 新增、编辑表弹框
 */
const editFieldTypeDialogRef = ref()
const openFieldTypeDialog = (type: string, row?) => {
  editFieldTypeDialogRef.value.open(type, cloneDeep(row))
}
/**
 * 删除
 * @param id
 */
const handleDelFieldType = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await deleteDataDomain(id)
    message.success('删除成功')
    // 刷新列表
    fieldTypeVxeTable.value.refresh()
  } catch {}
}
const fieldTypeSuccess=()=>{
  fieldTypeVxeTable.value.refresh()
}
onMounted(async () => {})
</script>

<style scoped lang="scss">
.subtitle {
  display: inline-block;
  width: 100%;
  border-bottom: 1px solid #e9e4e4;
  margin: 5px 0 15px;
  padding: 5px 0 5px 8px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 16px;
    background: #40a9ff;
    top: 9px;
    left: -3px;
  }
}
.tab-content {
  .btn {
    margin-bottom: 10px;
  }
  :deep(.j-vxe-table){
    height: calc(100vh - 250px);
  }
}
</style>
