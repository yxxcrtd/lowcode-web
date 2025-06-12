<template>
  <Dialog :title="title" v-model="dialogVisible" width="900" >
    <div class="dialog-wrap" style="max-height: 65vh;">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110" :disabled="bizType === 'view'">
        <el-row>
          <el-col :span="22">
            <el-form-item label="数据集名称" label-width="100" prop="name">
              <el-input v-model="form.name" @change="handleNameChange" autocomplete="off"/>
            </el-form-item>
          </el-col>
          <el-col :span="22">
            <el-form-item label="数据集编码" label-width="100" prop="code">
              <el-input v-model="form.code" autocomplete="off" @input="validateInput('code')" />
            </el-form-item>
          </el-col>
          <el-col :span="22" v-if="form.type === 'sql'">
            <el-form-item label="数据源" label-width="100" prop="sourceCode">
              <el-tree-select v-model="form.sourceCode" :data="dataList"/>
            </el-form-item>
          </el-col>
          <el-col :span="22" v-if="form.type === 'http'">
            <el-form-item label="调用方式" label-width="100" prop="callMethod">
              <el-select v-model="form.callMethod">
                <el-option label="前端调用" value="get" />
                <el-option label="后端调用" value="post" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="22" v-if="form.type === 'http'">
            <el-form-item label="请求地址" label-width="100" prop="url">
              <el-input
                v-model="form.url"
                class="input-with-select"
              >
                <template #prepend>
                  <el-select v-model="form.requestMethods" style="width: 115px">
                    <el-option label="get" value="get" />
                    <el-option label="post" value="post" />
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="22">
            <el-form-item label="描述" label-width="100" prop="remark">
              <el-input type="textarea" :rows="1" v-model="form.remark" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="22" v-if="form.type === 'json'">
            <el-form-item label="JSON数据" prop="jsonData">
              <JsonEditor :isFormat="bizType !== 'view'" v-model="form.jsonData" :readOnly="bizType === 'view'"></JsonEditor>
            </el-form-item>
          </el-col>
          <el-col :span="22" v-if="form.type === 'sql'">
            <el-form-item label="SQL语句" prop="sqlData">
              <CodeEditor mode="text/x-sql" v-model="form.sqlData" :readOnly="bizType === 'view'"></CodeEditor>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.type === 'http'">
            <el-tabs v-model="activeName" class="demo-tabs">
              <el-tab-pane label="请求头部" name="header"></el-tab-pane>
              <el-tab-pane label="请求参数" name="config"></el-tab-pane>
            </el-tabs>
            <el-button type="primary" :icon="Plus" class="mb-10px" size="small" @click="add"> 添加 </el-button>
            <div class="table-content" element-loading-text="加载中">
              <vxe-table border="inner" align="center" style="width: 100%;max-height: 25vh;overflow: auto;" :data="activeName === 'header' ? form.headerList : form.configList">
                <vxe-column field="field" :title="activeName === 'header' ? '请求头' : '参数名称'" minWidth="150">
                  <template #default="{ row, rowIndex }">
                    <el-form-item label-width="0"  :prop="'headerList[' + rowIndex + '].keyCode'">
                      <el-input v-model="row.keyCode" />
                    </el-form-item>
                  </template>
                </vxe-column>
                <vxe-column type="seq" :title="activeName === 'header' ? '内容' : '参数值'" minWidth="150" align="center">
                  <template #default="{ row, rowIndex }">
                    <el-form-item label-width="0" :prop="'headerList[' + rowIndex + '].value'">
                      <el-input v-model="row.value" />
                    </el-form-item>
                  </template>
                </vxe-column>
                <vxe-column field="action" title="操作" width="80">
                  <template #default="{ rowIndex }">
                    <div class="table-action">
                      <el-link type="primary" :disabled="bizType === 'view'" @click="deleteTag(rowIndex)">删除</el-link>
                    </div>
                  </template>
                </vxe-column>
              </vxe-table>
            </div>
          </el-col>
        </el-row>
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
import * as api from './api'
import {dataSourceList} from './api'
import {getPinyin} from '@/utils'

let title = '创建数据集'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const bizType=ref('create') // 操作类型 create新增 edit修改 view预览
const formRef = ref()
const form = ref({
  id: '',
  name: '',
  code: '',
  type: '',
  sourceName: '',
  sourceCode: '',
  remark: '',
  jsonData: '',
  sqlData: '',
  requestMethods:'get',
  headerList:[],
  configList:[]
})
const activeName = ref('header')
const jsonData = ref();
const rules = reactive({
  code: [{ required: true, message: '请输入数据集编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
  sourceCode: [{ required: true, message: '请选择数据源', trigger: 'blur' }],
  callMethod: [{ required: true, message: '请选择调用方式', trigger: 'blur' }],
  url: [{ required: true, message: '请输入请求地址', trigger: 'blur' }],
  keyCode:[{ required: true, message: '请输入', trigger: ['blur','change'] }],
  value:[{ required: true, message: '请输入', trigger: ['blur','change'] }]
})
// 数据集编码校验
const validateInput = (field) => {
  const regex = /^[a-zA-Z0-9.]*$/; // 允许英文、数字和点
  form.value[field] = form.value[field].split('').filter(char => regex.test(char)).join('');
}
/** 打开弹窗 */
const open = async (type: string, tableInfo) => {
  form.value = {
    id: '',
    name: '',
    code: '',
    type: '',
    sourceName: '',
    sourceCode: '',
    remark: '',
    jsonData: '',
    sqlData: '',
    requestMethods:'get',
    headerList:[],
    configList:[]
  }
  bizType.value=type
  dialogVisible.value = true
  const formRefValue = formRef.value;
  if (formRefValue) {
    formRefValue.resetFields();
  }
  if (type === 'create') {
    title = '创建数据集'
    form.value.type = tableInfo
  } else if(type === 'edit') {
    title = '编辑数据集'
    form.value = tableInfo
  } else {
    title = '预览数据集'
    form.value = tableInfo
  }
}
// 查询数据源列表
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

/** 生成编码 */
const handleNameChange=()=>{
  form.value.code=getPinyin(form.value.name,'SJJ-')
}

/** http请求头列表请求参数列表新增 */
const add = () => {
  if (activeName.value === 'header') {
    form.value.headerList.push({
      keyCode:'',
      value:'',
      type:activeName.value
    })
  } else if (activeName.value === 'config') {
    form.value.configList.push({
      keyCode:'',
      value:'',
      type:activeName.value
    })
  }
}

/** http请求头列表请求参数列表删除 */
const deleteTag = async (rowIndex) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    if (activeName.value === 'header') {
      form.value.headerList.splice(rowIndex,1)
    } else if (activeName.value === 'config') {
      form.value.configList.splice(rowIndex,1)
    }
  } catch {}
}

const props = defineProps({
  callback: Function,
})
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  if(bizType.value === 'view'){
    dialogVisible.value = false
    return
  }
  formRef.value.validate(async (valid) => {
    if (valid) {
      let res: any = null
      if (form.value.id) {
        res = await api.updateDataSourceConfig(form.value)
      } else {
        res = await api.createDataSourceConfig(form.value)
      }
      if (res) {
        message.success('提交成功！')
        dialogVisible.value = false
        emit('success', bizType.value,res.id)
        form.value = {
          id: '',
          name: '',
          code: '',
          type: '',
          sourceName: '',
          sourceCode: '',
          remark: '',
          jsonData: '',
          sqlData: ''
        }
      } else {
        message.error('表单验证失败，请检查输入')
      }
      if (props.callback) {
        props.callback();
      }
    } else {
      return false
    }
  })
}
</script>
<style lang="scss" scoped>
.table-content{
  :deep(.el-form-item--default){
    margin-bottom: 0px !important;
  }
}
</style>
