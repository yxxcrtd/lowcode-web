<template>
  <Dialog title="回显字段设置" v-model="dialogVisible" width="800">
    <div class="dialog-content">
      <el-form ref="formDataRef" label-width="auto" class="demo-formData" status-icon>
        <el-tabs v-model="activeName" tab-position="left">
          <el-tab-pane label="SQL模式" name="first">
            <el-row>
              <el-col :span="24">
                <el-form-item label="是否多选" prop="valueType">
                  <el-radio-group v-model="formData.valueType">
                    <el-radio label="单选" :value="0"></el-radio>
                    <el-radio label="多选" :value="1"></el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="回显表关联字段" prop="textSql" label-position="top">
                  <template #label>
                    <span>回显表关联字段</span>
                    <el-tag class="ml-10px">字段： {{curFieldRow.columnName}}_{{curFieldRow.moduleTableId}}</el-tag>
                    <span>
                      <el-popover placement="right" :width="600" trigger="hover">
                        <template #reference>
                          <el-link type="danger" style="margin-left: 16px">实例
                          <el-icon class="el-icon--right">
                            <arrow-down />
                          </el-icon>
                          </el-link>
                        </template>
                        <el-table :data="demoSqlData" :height="400">
                          <el-table-column width="100" property="sqlType" label="类型" />
                          <el-table-column property="sqlContent" label="sql" />
                          <el-table-column width="100" label="操作" >
                        <template #default="scope">
                          <el-link type="primary" size="small" @click="handleAddSql(scope.row)">插入</el-link>
                        </template>
                          </el-table-column>
                        </el-table>
                      </el-popover>
                    </span>
                  </template>
                  <CodeEditor v-model="formData.textSql" style="height: 300px" language="sql" theme="juejin" :init-code="initCode"></CodeEditor>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="配置模式" name="second">
            <el-row>
              <el-col :span="24">
                <el-form-item label="回显表" prop="region">
                  <ace-select class="sel-table" v-model="formData.tableId" filterable placeholder="请选择表" :data-source="tableDataSource" @change="tableChange">
                    <template #default="{option}">
                      <span style="float: left">{{ option.label }}</span>
                      <span
                        style="
            float: right;
            color: var(--el-text-color-secondary);
            font-size: 13px;
          "
                      >
          {{ option.tableName }}
        </span>
                    </template>
                  </ace-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="回显表关联字段" prop="region">
                  <ace-select v-model="formData.tableKey" placeholder="请选择关联字段" :data-source="columnList"></ace-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="回显字段" prop="region">
                  <ace-select v-model="formData.columnId" placeholder="请选择回显字段" :data-source="columnList"></ace-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
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
import { cloneDeep } from 'lodash-es'
import {ArrowDown} from "@element-plus/icons-vue";
import {getTableFields, getTablePage} from "@/web-admin/views/funMng/dev/api";

defineOptions({ name: 'ShowTableFieldDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const activeName=ref('first')
const formData = ref({
  tableId: '',
  tableKey: '',
  columnId: '',
  valueType:0,
  textSql:''
})
const curFieldRow=ref(null)
/** 打开弹窗 */
const open = async (row) => {
  console.log('123123',row)
  curFieldRow.value=cloneDeep(row)
  dialogVisible.value = true
  formData.value.tableId=row.textTableId
  formData.value.tableKey=row.textTableKey
  formData.value.columnId=row.textColumnId
  formData.value.valueType=row.valueType || 0
  formData.value.textSql=row.textSql
  if(!tableDataSource.value || tableDataSource.value.length < 1){
    loadTableList()
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const initCode=` //实例 返回用户名称
 // select id as SHOW_VALUE,REALNAME SHOW_TEXT from SYS_USER where id=#{CREATE_BY_1894191348934537217}
`
const tableDataSource=ref([])
const loadTableList=async ()=>{
  const params = {
    page: 1,
    pageSize: 1000
  }
  const res = await getTablePage(params)
  tableDataSource.value=res.list.map(item=>{
    return {
      value: item.id,
      label: item.tableComment,
      tableName:item.tableName
    }
  })
}
const demoSqlData=ref([
  {
    sqlType:'用户',
    sqlContent:`select 
ID as SHOW_VALUE,REALNAME SHOW_TEXT 
from SYS_USER 
where id=#{CUSTOMER_MANAGER_1905973278659084290}`,
  },{
    sqlType:'交易对手',
    sqlContent:`select 
CUSTOMER_CODE as SHOW_VALUE,CUSTOMER_NAME SHOW_TEXT 
from CUST_CUSTOMER_MAIN 
where CUSTOMER_CODE=#{CUST_NAME_1894674619392942082}`,
  },{
    sqlType:'开户机构',
    sqlContent:`select 
ID as SHOW_VALUE,branchInstitutionName SHOW_TEXT 
from INTF_FINA_BRA_INFO 
where id=#{OPEN_INST_1904102557590876162}`,
  },{
    sqlType:'部门',
    sqlContent:`select 
ID as SHOW_VALUE,DEPART_NAME SHOW_TEXT 
from SYS_DEPART 
where id=#{DEPARTMENT_1904102557590876162}`,
  },{
    sqlType:'地区',
    sqlContent:`select
    LISTAGG(to_char(NODE_TEXT), '/') WITHIN GROUP (ORDER BY NODE_LEVEL) AS SHOW_TEXT,
    #{REGION_1904102557590876162} as SHOW_VALUE
from (SELECT PARENT_CODE,NODE_TEXT,NODE_CODE,NODE_LEVEL
               FROM comm_tree_data where TREE_TYPE='COUNTRY_WITH_AREA' and NODE_CODE!='1')
START WITH NODE_CODE = #{REGION_1904102557590876162}
CONNECT BY PRIOR   PARENT_CODE =NODE_CODE
ORDER SIBLINGS BY NODE_TEXT;`,
  },{
    sqlType:'多选用户',
    sqlContent:`select 
ID as SHOW_VALUE,REALNAME SHOW_TEXT 
from SYS_USER 
where id in <foreach collection="CSRY_1897835158856024065.split(',')" item="item" open="(" separator="," close=")">#{item}</foreach>;`,
  }
])
const handleAddSql=(row)=>{
  formData.value.textSql=row.sqlContent
}

const columnList=ref([])

const loadColumnList=async ()=>{
  let param = { tableId: formData.value.tableId, status: true, pageSize: 100, pageNo: 1 }
  const res = await getTableFields(param)
  columnList.value= res.list.map((item) => {
    return {
      value: item.id,
      label: item.columnComment || item.columnName,
      columnName: item.columnName,
      columnType: item.columnType,
      leaf: true
    }
  })
}
watch(
  () => formData.value.tableId,
  (val) => {
    if (val) {
      loadColumnList()
    }
  },
  { immediate: true }
)
const tableChange=()=>{
  formData.value.tableKey=null
  formData.value.columnId=null
}

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  dialogVisible.value = false
  emit('success', cloneDeep(formData.value))
}

</script>
<style lang="scss" scoped>
.dialog-content {
  height: 400px;
}
</style>
