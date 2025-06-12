<template>
  <Dialog title="按钮动作配置" v-model="dialogVisible" width="1000" top="5vh">
    <div class="dialog-content">
      <el-form :model="formData" ref="formRef" label-width="110" v-if="isLoad">
        <el-form-item label="新增方式" prop="newAddType" v-if="curRow.operationType === 'tableAdd'">
          <el-select v-model="formData.newAddType" placeholder="请选择新增方式">
            <el-option v-for="item in addTypeOption" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="动作类型" prop="dataType">
          <el-select v-model="formData.actionType" placeholder="请选择操作类型">
            <el-option v-for="item in actionTypeOption" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <template v-if="formData.actionType === 'serverApi'" >
          <el-form-item label="服务类型" prop="name">
            <el-radio-group v-model="formData.serverType">
              <el-radio value="modelService">模型服务</el-radio>
              <el-radio value="api">指定接口</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="formData.serverType==='modelService'" label="关联服务" prop="modelServerId">
            <SelectApi v-if="rowModuleId" v-model="formData.modelServerId" :moduleId="rowModuleId"></SelectApi>
            <SelectModelApi v-else v-model="formData.modelServerId"></SelectModelApi>
          </el-form-item>
          <template v-if="formData.serverType==='api'">
            <el-form-item label="接口类型" prop="apiType">
              <el-radio-group v-model="formData.apiType">
                <el-radio value="GET">GET</el-radio>
                <el-radio value="POST">POST</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="接口地址" prop="apiUrl">
              <el-input v-model="formData.apiUrl" placeholder="请输入地址，内部页面使用相对地址，外部页面使用完整地址" />
            </el-form-item>
            <el-form-item label="接口模型参数" prop="apiModelParams" v-if="rowModuleId">
              <SelectModelField v-model="formData.apiModelParams" multiple :moduleId="rowModuleId"></SelectModelField>
            </el-form-item>
            <el-form-item label="接口其他参数" prop="apiOtherParams">
              <el-input v-model="formData.apiOtherParams" placeholder="请输入json格式字符串" />
            </el-form-item>
          </template>
        </template>
        <template v-if="formData.actionType === 'openPage'">
          <el-form-item label="打开方式" prop="openWay">
            <el-select v-model="formData.openWay">
              <el-option
                v-for="(item, index) in openWayOption"
                :key="'openWay_' + index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关联页面类型" prop="name">
            <el-radio-group v-model="formData.pageType">
              <el-radio value="modelPage">模型页面</el-radio>
              <el-radio value="url">指定地址</el-radio>
              <el-radio value="component">指定组件</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="关联页面" prop="relevancePage" v-if="formData.pageType==='modelPage'">
            <el-select v-model="formData.relevancePage">
              <el-option v-for="(item, index) in relevancePageOption" :key="'relevancePage_' + index" :label="item.pageName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="跳转地址" prop="relevanceUrl" v-if="formData.pageType==='url'"> 
            <el-input v-model="formData.relevanceUrl" placeholder="请输入地址，内部页面使用相对地址，外部页面使用完整地址" />
          </el-form-item>
          <el-form-item label="跳转地址" prop="relevanceComponent" v-if="formData.pageType==='component'">
            <el-input v-model="formData.relevanceComponent" placeholder="请输入组件地址，输入src目录下的完整地址" />
          </el-form-item>
          <el-form-item label="页面参数" prop="serverParams" v-if="rowModuleId">
            <SelectModelField v-model="formData.serverParams" multiple :moduleId="rowModuleId"></SelectModelField>
          </el-form-item>
        </template>
        <template v-if="formData.actionType === 'customEvent'">
          <el-form-item label="自定义方法名" prop="customMethod">
            <el-input v-model="formData.customMethod" placeholder="配置外部js方法名"/>
          </el-form-item>
        </template>
        <template v-if="formData.actionType === 'customScript'">
          <el-form-item label="脚本" prop="dataScript">
            <CodeEditor v-model="formData.dataScript" style="height: 500px" :initCode="initCode"></CodeEditor>
          </el-form-item>
        </template>
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
import {getDictTypeList, getPageModuleInfo} from '../api'
import SelectApi from '@/web-admin/views/funMng/dev/Components/SelectAPI.vue'
import SelectModelField from './SelectModelField.vue'
import SelectModelApi from "@/web-admin/views/funMng/dev/Components/SelectModelAPI.vue";
import request from "@/config/axios";

defineOptions({ name: 'ButtonActionCfgDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formRef = ref()
const formData = ref({
  newAddType:'',
  actionType: '',
  modelServerId: '',
  serverType:'',
  apiType:'',
  apiUrl:'',
  apiModelParams:'',
  apiOtherParams:'',
  openWay:'new-tab',
  serverParams:[],
  pageType:'modelPage',
  relevancePage:'',
  relevanceUrl:'',
  relevanceComponent:'',
  customMethod:'',
  dataScript: ''
})
const actionTypeOption = reactive([
  { label: '调用服务', value: 'serverApi' },
  { label: '打开页面', value: 'openPage' },
  { label: '自定义事件', value: 'customEvent' },
  { label: '自定义脚本', value: 'customScript' }
])

const addTypeOption = reactive([
  { label: '默认规则(6个行内，6-12弹框，12以上抽屉)', value: 'default' },
  { label: '新增行', value: 'row' },
  { label: '弹框', value: 'dialog' },
  { label: '抽屉', value: 'drawer' }
])

const openWayOption = ref([
  { label: '默认', value: 'default' },
  { label: '新页签', value: 'new-tab' },
  { label: '弹框', value: 'dialog' },
  { label: '全屏弹框', value: 'dialog-fullscreen' },
  { label: '抽屉', value: 'drawer' },
  { label: '当前页签', value: 'cur-tab' }
])
const initCode=ref(`function handleEvent(ctx,btnCfg,formData,data,renderUtil){
    //ctx为页面上下文
    //btnCfg 按钮信息
    //formData 表单数据 或 行内数据 调用字段可以使用模板字符串【#字段名#】或
    //data 组件事件参数
    //renderUtil 公共方法
    console.log('handleEvent',ctx,btnCfg,formData,data)
}
`)
let relevancePageOption = ref<any[]>([])
const getPageList = async () => {
  const params={
    pageSize:100,
    pageNo: 1,
  }
  let res = await request.get({url: '/cfg/page-info/page',params})
  relevancePageOption.value = res.list || []
}
getPageList()
const isLoad=ref(false)
const rowModuleId=ref('')
const curRow=ref('')
/** 打开弹窗 */
const open = async (data,row) => {
  isLoad.value=false
  await nextTick()
  formData.value = {
    newAddType:'',
    actionType: '',
    modelServerId: '',
    openWay:'new-tab',
    serverParams:[],
    pageType:'modelPage',
    relevancePage:'',
    relevanceUrl:'',
    relevanceComponent:'',
    customMethod:'',
    dataScript: ''
  }
  dialogVisible.value = true
  if (data) {
    formData.value = data
  }
  rowModuleId.value=row.moduleId
  curRow.value=row
  isLoad.value=true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  dialogVisible.value = false
  emit('success', cloneDeep(formData.value))
}
</script>
<style lang="scss" scoped>
.dialog-content {
  height: 568px;
}
</style>
