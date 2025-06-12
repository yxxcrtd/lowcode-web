<template>
  <Dialog title="校验配置" v-model="dialogVisible" width="800">
    <div class="validate-dialog-content">
      <el-form ref="formRef" label-width="auto">
        <el-row v-for="(item, index) in formData" :key="index" :gutter="20">
          <el-col :span="4">
            {{item.checkName}}
            <el-checkbox v-model="item.isSelect"></el-checkbox>
          </el-col>
          <el-col :span="8">
            <el-form-item label="提示信息" prop="modelName">
              <el-input v-model="item.toolTips" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <div v-if="item.condition">
              <el-form-item v-if="item.validateType==='length'" label="最大长度">
                <ace-input-number v-model="item.condition.maxLength" :min="1" :decimalLimit="0" />
              </el-form-item>
              <el-form-item v-if="item.validateType==='range'" label="区间">
                <div class="r-content">
                  <ace-select v-model="item.rangeType" :data-source="rangeTypeOptions" class="r-rangetype" @change="handleRangeTypeChange(item)"></ace-select>
                  <template v-if="item.rangeType=='var'">
                    <SelectModelField v-model="item.condition.min" :module-id="moduleId" class="r-min"></SelectModelField>
                    ~
                    <SelectModelField v-model="item.condition.max" :module-id="moduleId" class="r-max"></SelectModelField>
                  </template>
                  <template v-else>
                    <el-input v-model="item.condition.min" class="r-min"/>
                    ~
                    <el-input v-model="item.condition.max" class="r-max"/>
                  </template>
                </div>
              </el-form-item>
              <el-form-item v-if="item.validateType==='regular'" label="正则">
                <ace-autocomplete v-model="item.condition.regularType" :data-source="regularOption" label-key="label" :is-not-search="true"></ace-autocomplete>
              </el-form-item>
              <el-form-item v-if="item.validateType==='api'" label="接口地址">
                <el-input v-model="item.condition.apiUrl" />
              </el-form-item>
              <el-form-item v-if="item.validateType==='customValidate'" label="自定义方法">
                <CodeInput v-model="item.condition.methodScript" :initCode="isTable ? initTableCode : initCode"/>
              </el-form-item>
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
import {cloneDeep} from "lodash-es";
import SelectModelField from '@/web-admin/views/funMng/dev/Components/SelectModelField.vue'
import {propTypes} from "@/utils/propTypes";
import CodeInput from '@/components/CodeInput/index.vue'

defineOptions({ name: 'EditDialog' })

const formValidateList=ref([
  // {
  //   checkName:'必填校验',
  //   validateType:'required',
  //   isSelect:false,
  //   condition:null,
  //   toolTips:''
  // },
  {
    checkName:'长度校验',
    validateType:'length',
    isSelect:false,
    condition:{
      maxLength:''
    },
    toolTips:''
  },{
    checkName:'区间校验',
    validateType:'range',
    isSelect:false,
    condition:{
      min:'',
      max:''
    },
    toolTips:''
  },{
    checkName:'正则校验',
    validateType:'regular',
    isSelect:false,
    condition:{
      regularType:'',
      regularValue:''
    },
    toolTips:''
  },{
    checkName:'接口校验',
    validateType:'api',
    isSelect:false,
    condition:{
      apiUrl:''
    },
    toolTips:''
  },{
    checkName:'自定义校验',
    validateType:'customValidate',
    isSelect:false,
    condition:{
      methodScript:''
    },
    toolTips:''
  }
])
const initCode = `function customValidate(rule,value,callback,formData,ctx,renderUtil){
    //自定义校验必须返回callback，参考elementPlus官方文档
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】或具体结构【formData[1894191348934537217][PROJECT_NAME_1894191348934537217]】格式
    callback()
}
`
const initTableCode = `function customValidate(rule,value,callback,col,row,rowIndex){
    //自定义校验必须返回callback，参考elementPlus官方文档
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】或具体结构【row[1894191348934537217][PROJECT_NAME_1894191348934537217]】格式
    callback()
}
`
const message = useMessage() // 消息弹窗
const props=defineProps({
  moduleId:propTypes.string,
})
const dialogVisible = ref(false)
const formRef = ref()
const formData:any = ref([])
const isTable=ref(false)
const regularOption=ref([
  {label:"数字",value:"^[0-9]*$"},
  {label:"英文+数字",value:"^[A-Za-z0-9]+$"},
  {label:"邮箱",value:"^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$"},
  {label:"手机号",value:"/^(?:(?:\\\\+|00)86)?1\\[3-9\\]\\\\d{9}$/"},
  {label:"身份证",value:"^\\d{15}|\\d{18}$"},
  {label:"固定电话",value:"d{3}-d{8}|d{4}-d{7}"},
  {label:"邮政编码",value:"[1-9]d{5}(?!d)"},
  {label:"URL",value:"/^(((ht|f)tps?):\\\\/\\\\/)?\\[\\\\w-\\]+(\\\\.\\[\\\\w-\\]+)+(\\[\\\\w.,@?^=%&:/~+#-\\]\\*\\[\\\\w@?^=%&/~+#-\\])?$/"},
])

const rangeType=ref('text')
const rangeTypeOptions=ref([
  {label:'文本',value:'text'},
  {label:'变量',value:'var'}
])
/** 打开弹窗 */
const open = async (data, tableData, isChildTable) => {
  dialogVisible.value = true
  const showItemNum = tableData.filter(item => item.isVisible == 1).length
  const isInTable = showItemNum < 6
  formData.value=cloneDeep(formValidateList.value)
  isTable.value= isChildTable && isInTable
  if(data){
    formData.value=formData.value.map(item=>{
      const dataItem=data.find(childItem=>childItem.validateType===item.validateType)
      if(dataItem){
        return {...dataItem,isSelect:true}
      }else{
        return item
      }
    })
    console.log(formData.value)
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  const params=formData.value.filter(item=>item.isSelect)
  emit('success',cloneDeep(params))
  dialogVisible.value=false
}
const handleRangeTypeChange=(item)=>{
  item.condition.min=null
  item.condition.max=null
}
</script>
<style lang="scss" scoped>
.validate-dialog-content{
  padding: 10px 20px;
}
.r-content{
  display: flex;
  .r-rangetype{
    margin-right: 4px;
  }
}
</style>
