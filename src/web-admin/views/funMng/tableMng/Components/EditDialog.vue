<template>
  <Dialog :title="title" v-model="dialogVisible" width="600" @closed="closed">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
        <el-form-item label="表名" prop="tableName">
          <el-input v-model="form.tableName" ></el-input>
        </el-form-item>
        <el-form-item label="显示名称" prop="tableComment">
          <el-input v-model="form.tableComment" />
        </el-form-item>
        <!-- <el-form-item label="是否系统表" prop="isSys">
          <el-switch
            v-model="form.isSys"
            inline-prompt
            active-text="是"
            inactive-text="否"
          />
        </el-form-item> -->
        <el-form-item label="表类型" prop="tableType">
          <el-radio-group v-model="form.tableType">
            <el-radio value="biz_table">业务表</el-radio>
            <el-radio value="sys_table">系统表</el-radio>
            <el-radio value="virtual_table">
              虚拟表
              <el-tooltip
                content="虚拟表是可配置一段组合sql，并配置字段"
                placement="right"
              >
                <el-icon><Warning /></el-icon>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据源" prop="datasourceId">
<!--          <el-select v-model="form.datasourceId" placeholder="请选择数据源">
            <el-option v-for="item in dataList" :key="item.value" :label="item.label" :value="item.value">
              <span style="float: left">{{ item.label }}</span>
              <span style="float: right; color: var(&#45;&#45;el-text-color-secondary); font-size: 13px">
                {{ item.value }}
              </span>
            </el-option>
          </el-select>-->
          <el-tree-select
            v-model="form.datasourceId"
            :data="dataList"
          />
        </el-form-item>
        <el-form-item label="模型描述" prop="remark">
          <el-input v-model="form.remark" :rows="2" type="textarea" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import {Warning} from '@element-plus/icons-vue'
import {addTable, getSysConfigList, tableVO, updateTable,dataSourceList} from '../api'
import { useSysConfigStore } from '@/store/modules/sysConfig';

defineOptions({ name: 'EditDialog' })

const useSysConfig = useSysConfigStore()
const dataSourceConfig = useSysConfig.getDataSourceConfig
let title = '创建表'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const bizType=ref('create')
const formRef = ref()
const form = ref<tableVO>({
  id: '',
  tableName: '',
  tableComment: '',
  datasourceId: '',
  tableType:'biz_table',
  remark: '',
  isSys: false
})
const tableRules=ref({})
const param={
  category:'Cfg_Database'
}
// 获取配置管理页面表名配置规则
getSysConfigList(param).then(res=>{
  res.forEach(item=>{
    if(['table_name_prefix','table_name_rule'].includes(item.key) ){
      tableRules.value[item.key]=item.value
    }
  })
})
// 表名校验
const validateTableName = (_rule: any, value: any, callback: any) => {
  if (!(value && !(value.indexOf(dataSourceConfig.table_name_prefix) === 0 && value.length === dataSourceConfig.table_name_prefix.length)) ) {
    callback(new Error('请输入表名'))
  } 
  else if(!(new RegExp(dataSourceConfig.table_name_rule,'g').test(value))){
    callback(new Error(dataSourceConfig.table_name_rule_tips || `请输入正确的格式`))
  }
  else {
    callback()
  }
}
// 名称校验
const validateTableComment = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入显示名称'))
  } else if(value.length > 64){
    callback(new Error('显示名称最大长度64位'))
  } else {
    callback()
  }
}
const rules = reactive({
  tableName: [{ required: true, validator: validateTableName, trigger: 'blur' }],
  tableComment: [{ required: true, validator: validateTableComment,  trigger: 'blur' }],
  datasourceId: [{ required: true, message: '请选择数据源', trigger: 'blur' }]
})

let dataList = reactive<Option[]>([])
const getDataSourceList = async () => {
  const list:any[] = await dataSourceList()
  let datasMap = new Map
  list.forEach(item => {
    const ip = item.ip + ""
    if (!datasMap.has(ip)) {
      let dataItemList: Option[] = []
      let objItem: Option = {
        label: item.name,
        value: item.id
      }
      dataItemList.push(objItem)
      datasMap.set(ip, dataItemList)
    } else {
      let dataItemList = datasMap.get(ip)
      let objItem = {label: item.name, value: item.id}
      dataItemList.push(objItem)
    }
  })
  for (let key of datasMap.keys()) {
    let item: Option = {value: key, label:key, children: []}
    item.children = datasMap.get(key)
    dataList.push(item)
  }

}
getDataSourceList()

/** 打开弹窗 */
const open = async (type: string, tableInfo) => {
  form.value = {
    id: '',
    tableName: tableRules.value.table_name_prefix,
    tableComment: '',
    datasourceId: '',
    remark: '',
    isSys: false,
    tableType:'biz_table'
  }
  bizType.value=type
  dialogVisible.value = true
  if (type === 'create') {
    title = '创建表'
  } else {
    title = '编辑表'
    form.value = tableInfo
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success','closed']) // 定义 success 事件，用于操作成功后的回调
const curId=ref(null)
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      let res: any = null
      if (form.value.id) {
        res = await updateTable(form.value)
      } else {
        res = await addTable(form.value)
      }
      if (res) {
        message.success('提交成功！')
        dialogVisible.value = false
        if(bizType.value==='create'){
          curId.value=res
        }
        emit('success', bizType.value,res)
        form.value = {
          id: '',
          tableName: '',
          tableComment: '',
          datasourceId: '',
          remark: '',
          isSys: false
        }
      } else {
        message.error('表单验证失败，请检查输入')
      }
    } else {
      return false
    }
  })
}

const closed=()=>{
  if(curId.value){
    emit('closed',bizType.value,curId.value)
    curId.value=null
  }
}
</script>
<style scoped lang="scss">
:deep(.el-tree .el-tree-node .el-tree-node__content .el-select-dropdown__item){
    font-weight: 600 !important;
}
.el-tree .el-tree-node .el-tree-node__content .el-select-dropdown__item{
  font-weight: 600 !important;
}
</style>
