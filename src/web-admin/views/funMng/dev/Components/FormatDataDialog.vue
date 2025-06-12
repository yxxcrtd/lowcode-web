<template>
  <Dialog title="数据格式化" v-model="dialogVisible" width="800">
    <div class="dialog-content">
      <el-form :model="formData" ref="formRef" label-width="130">
        <el-row>
          <el-col :span="12">
            <el-form-item label="前缀" prop="prefix">
              <el-input v-model="formData.prefix" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="后缀" prop="suffix">
              <el-input v-model="formData.suffix" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="格式化类型" prop="formatType">
              <el-select v-model="formData.formatType" placeholder="请选择">
                <el-option v-for="item in formatOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="formData.formatType === 'number'">
            <el-form-item label="数字类型" prop="numType">
              <el-radio-group v-model="formData.numType">
                <el-radio value="1">整数</el-radio>
                <el-radio label="2">小数</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <template v-if="['number', 'amt', 'rate'].includes(formData.formatType)">
            <el-col :span="12">
              <el-form-item label="保留小数位" prop="keepDecimalPlaces">
                <el-input v-model="formData.keepDecimalPlaces" type="number" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="转换倍率" prop="conversionRate">
                <el-input v-model="formData.conversionRate" type="number" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示千分位符" prop="thousandth">
                <el-switch v-model="formData.thousandth" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
              </el-form-item>
            </el-col>
          </template>
          <el-col :span="12" v-if="formData.formatType === 'datetime'">
            <el-form-item label="日期格式" prop="dateFormat">
              <el-autocomplete
                v-model="formData.dateFormat"
                :fetch-suggestions="querySearch"
                clearable
                class="inline-input w-50"
                placeholder="请选择或输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.formatType === 'img'">
            <el-form-item label="图片样式" prop="pictureStyle">
              <el-input v-model="formData.pictureStyle" type="textarea" :rows="4" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.formatType === 'link'">
            <el-form-item label="链接打开方式" prop="linkOpenMethod">
              <el-select v-model="formData.linkOpenMethod" placeholder="请选择字典">
                <el-option v-for="item in openWayOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.formatType === 'link'">
            <el-form-item label="地址" prop="linkAddress">
              <el-input v-model="formData.linkAddress" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.formatType === 'regular'">
            <el-form-item label="正则表达式" prop="regularExpression">
              <el-input v-model="formData.regularExpression" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.formatType === 'slot'">
            <el-form-item label="组件名" prop="componentName">
              <el-input v-model="formData.componentName" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.formatType === 'script'">
            <el-form-item label="脚本" prop="script">
              <CodeEditor v-model="formData.script" :initCode="initCode"></CodeEditor>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-more-footer">
        <div class="left"> <el-button type="primary" @click="clearCfg" link>清空配置</el-button></div>
        <div class="right">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'

defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formRef = ref()
const formData = ref({
  prefix: '',
  suffix: '',
  numType: '',
  keepDecimalPlaces: '',
  conversionRate: '',
  thousandth: false,
  dateFormat: '',
  pictureStyle: '',
  linkOpenMethod: '',
  linkAddress: '',
  regularExpression: '',
  componentName: '',
  formatType: '',
  script: ''
})
const formatOption = reactive([
  { label: '数字格式', value: 'number' },
  { label: '金额格式', value: 'amt' },
  { label: '比率格式', value: 'rate' },
  { label: '日期格式', value: 'datetime' },
  { label: '图片格式', value: 'img' },
  { label: '链接格式', value: 'link' },
  { label: '正则表达式格式化', value: 'regular' },
  { label: '自定义组件', value: 'slot' },
  { label: '自定义脚本', value: 'script' }
])
const openWayOption = reactive([
  { label: '新页签', value: 'newTab' },
  { label: '弹框', value: 'dialog' },
  { label: '抽屉', value: 'drawer' },
  { label: '当前页', value: 'curTab' },
  { label: '新页面', value: 'newPage' }
])
const initCode=` //上下文，可以获取页面的变量、组件、方法
 const ctx=context;
//itemConfig:字段配置参数；itemData:字段绑定值;rowData:行内按钮行内数据
 const ｛itemConfg,itemData,rowData｝=data;
 
 return true;
`
/** 打开弹窗 */
const open = async (type: string, data) => {
  formData.value = {
    prefix: '',
    suffix: '',
    numType: '',
    keepDecimalPlaces: '',
    conversionRate: '',
    thousandth: false,
    dateFormat: '',
    pictureStyle: '',
    linkOpenMethod: '',
    linkAddress: '',
    regularExpression: '',
    componentName: '',
    formatType: '',
    script: ''
  }
  dialogVisible.value = true
  if (data) {
    formData.value = data
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  dialogVisible.value = false
  emit('success', cloneDeep(formData.value))
}

const clearCfg = () => {
  dialogVisible.value = false
  emit('success', null)
}
const dataTypeFormaterOption = [
  { value: 'YYYY', label: '' },
  { value: 'YYYY-MM', label: '' },
  { value: 'YYYY-MM-DD', label: '' },
  { value: 'YYYY-MM-DD HH', label: '' },
  { value: 'YYYY-MM-DD HH:mm', label: '' },
  { value: 'YYYY-MM-DD HH:mm:ss', label: '' },
  { value: 'MM-DD HH:mm:ss', label: '' },
  { value: 'HH:mm:ss', label: '' }
]
const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? dataTypeFormaterOption.filter((item) => item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
    : dataTypeFormaterOption
  cb(results)
}
</script>
<style lang="scss" scoped>
.dialog-content {
}
</style>
