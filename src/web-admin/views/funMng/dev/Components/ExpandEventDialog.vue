<template>
  <Dialog :title="title" v-model="dialogVisible" width="80vw" top="5vh">
    <div class="dialog-wrap">
      <el-form ref="formRef" :model="formData" label-width="140">
        <el-row>
          <el-col :span="12">
            <el-form-item label="事件类型" prop="eventType">
              <el-radio-group v-model="formData.eventType">
                <el-radio v-for="(item, index) in eventTypeOption" :key="'eventType_' + index" :value="item.value" @change="handleEventCodeTypeChange($event, item)">{{
                  item.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否拦截主操作" prop="isIntercept">
              <el-switch v-model="formData.isIntercept" :active-value="true" :inactive-value="false" inline-prompt active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联api" prop="apiCode">
              <el-select v-model="formData.apiCode" @change="selectApi">
                <el-option v-for="(item, index) in apiList" :key="'list_templateApiList_' + index" :label="item.apiName" :value="item.apiCode" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行时机" prop="runTime">
              <el-select v-model="formData.runTime">
                <el-option v-for="(item, index) in runTimeOptions" :key="'runTime_' + index" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行顺序" prop="sort">
              <el-input v-model="formData.sort" style="width: 110px" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用类型" prop="callType">
              <el-radio-group v-model="formData.callType">
                <el-radio value="1">调用方法</el-radio>
                <el-radio value="2">调用接口</el-radio>
                <el-radio value="3">执行代码</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <template v-if="formData.callType == '1'">
            <el-col :span="24">
              <el-form-item label="接口" prop="interfaceName">
                <el-input v-model="formData.interfaceName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="方法名" prop="methodName">
                <el-input v-model="formData.methodName"></el-input>
              </el-form-item>
            </el-col>
          </template>
          <template v-else-if="formData.callType == '2'">
            <el-col :span="24">
              <el-form-item label="接口地址" prop="interfaceUrl">
                <el-input v-model="formData.interfaceUrl"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="参数" prop="interfaceParam">
                <el-input v-model="formData.interfaceParam"></el-input>
              </el-form-item>
            </el-col>
          </template>
          <template v-else>
            <el-col :span="24">
              <el-form-item label="执行代码" prop="executableCode"  style="height: 900px">
                <CodeEditor v-model="formData.executableCode" :initCode="initCode"></CodeEditor>
              </el-form-item>
            </el-col>
          </template>
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
import { ref, nextTick } from 'vue'
import { SetUp, Delete } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash-es'
import { propTypes } from '@/utils/propTypes'
import {eventType} from "../data"

defineOptions({ name: 'ExpandEventDialog' })

const eventTypeOption = ref(eventType)
const props = defineProps({
  apiList: propTypes.array.def([])
})
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false)
const formRef = ref()
const formData = ref({
  eventType: 'font',
  runTime: '',
  callType: '1',
  interfaceName: '',
  methodName: '',
  executableCode: '',
  sort: '',
  isIntercept: 0,
  interfaceUrl: '',
  interfaceParam: ''
})
const initCode=`function customEvent(ctx,apiInfo,formData,flowNodeInfo,renderUtil){
    //ctx为页面上下文
    //apiInfo 页面当前配置信息
    //formData 表单信息
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】
    //或具体结构【formData['1894191348934537217']['PROJECT_NAME_1894191348934537217']】格式
    //渲染引擎公共方法库
    console.log('customEvent',ctx,apiInfo,flowNodeInfo,formData)
}
`
const bizType = ref('create')
const title = ref('新建事件')
/** 打开弹窗 */
const open = async (type: string, eventInfo) => {
  formData.value = {}
  bizType.value = type
  dialogVisible.value = true
  if (type === 'create') {
    title.value = '新建事件'
    formData.value = {
      eventType: 'font',
      runTime: '',
      callType: '1',
      interfaceName: '',
      methodName: '',
      executableCode: '',
      sort: '',
      isIntercept: 0,
      interfaceUrl: '',
      interfaceParam: ''
    }
  } else {
    title.value = '编辑事件'
    formData.value = eventInfo
  }
  const eventItem = eventTypeOption.value.find((item) => item.value === formData.value.eventType)
  runTimeOptions.value = eventItem.children
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const runTimeOptions = ref([])
const handleEventCodeTypeChange = (val, item) => {
  formData.value.runTime = null
  runTimeOptions.value = item.children
}

const selectApi = (e) => {
  let api = props.apiList.find(item => item.apiCode === e)
  formData.value.serviceId= api.serverId
  formData.value.apiCode = api.apiCode
  formData.value.pageApiId = api.apiId
  formData.value.pageId = api.pageId
}

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      dialogVisible.value = false
      emit('success', bizType.value, cloneDeep(formData.value))
    } else {
      message.error('表单验证失败，请检查输入')
      return false
    }
  })
}
console.log('apiList',props.apiList)

onMounted(() => {})
</script>
<style lang="scss" scoped>
.dialog-wrap {
  display: flex;
  .left-wrap {
    width: 152px;
    height: 500px;
    border-right: 1px solid #e8eaed;
    padding: 5px 10px 5px 0;
    margin-right: 12px;
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      li {
        padding: 2px 4px;
        border-radius: 4px;
        line-height: 27px;
        margin-bottom: 4px;
        i {
          margin-right: 5px;
          top: 2px;
          font-size: 14px;
          color: #409eff;
        }
      }
      li:hover {
        background: #edf1ff;
        color: #409eff;
        cursor: pointer;
      }
      .active {
        background: #edf1ff;
        color: #409eff;
        cursor: pointer;
      }
    }
  }
}
.edit-content {
  border: 1px solid #d7d7d7;
  border-radius: 4px;
  padding: 14px 10px;
}
.filter-list {
  margin-top: 10px;
  .filter-item {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin-bottom: 8px;

    .item-remove {
      font-size: 14px;
      margin: 0 15px;
    }
    > div {
      margin: 0 2px;
    }
  }
}
</style>
