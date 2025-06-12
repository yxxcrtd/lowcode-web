<template>
  <el-tooltip ref="tooltipRef" placement="top" :content="curDefValue" :disabled="!curDefValue" raw-content popper-class="def-value-tooltip">
    <el-input
      v-model="curDefValue"
      clearable
      placeholder="请输入或选择默认值"
    >
      <template #append>
        <el-dropdown @command="selectDefItem">
          <el-button :icon="ArrowDown" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="item.value" v-for="(item,index) in defDataSource" :key="'def-item-'+index">{{item.label}}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-input>
  </el-tooltip>
  <Dialog
    v-model="dialogVisible"
    title="默认值脚本"
    width="800"
  >
    <div class="dialog-content">
      <CodeEditor v-model="customScriptVal" style="height:308px" :init-code="initCode"></CodeEditor>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="saveCustomScript">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import {propTypes} from "@/utils/propTypes";
import {ArrowDown} from "@element-plus/icons-vue";

defineOptions({ name: 'SetDefValue' })

const props = defineProps({
  modelValue: propTypes.string.def('')
})
const emit = defineEmits(['update:modelValue','change'])
const curDefValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})
const curSelValue=ref()

const dialogVisible = ref(false)
const customScriptVal=ref('')
const initCode=`function setDefValue(ctx,fieldConfig,formData,renderUtil){
    //设置默认值必须使用return返回数据
    //ctx为页面上下文
    //fieldConfig 当前字段的配置信息
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】
    //或具体结构【formData['1894191348934537217']['PROJECT_NAME_1894191348934537217']】格式
    //renderUtil为公共方法模块，可以使用renderUtil.testM()方法调用
    console.log('change',ctx,fieldConfig,formData)
    return '';
}
`

const defDataSource=ref([
  { label:'当前用户姓名', value:'${curUserName}'},
  { label:'当前用户登录名', value:'${curUserLoginName}'},
  { label:'当前用户ID', value:'${curUserId}'},
  { label:'当前组织名称', value:'${curOrgName}'},
  { label:'当前组织ID', value:'${curOrgId}'},
  { label:'当前部门名称', value:'${curDeptName}'},
  { label:'当前部门ID', value:'${curDeptId}'},
  { label:'当前日期', value:'${curDate}'},
  { label:'当前时间', value:'${curTime}'},
  { label:'当前职务名称', value:'${curJobName}'},
  { label:'当前职务ID', value:'${curJobId}'},
  { label:'从入参获取', value:'${query.?}'},
  { label:'自定义脚本', value:'customScript'},
])

const selectDefItem=(val)=>{
  if(val==='customScript'){
    customScriptVal.value=null
    if(!curDefValue.value || curDefValue.value.indexOf('function')>-1){
      customScriptVal.value=curDefValue.value
    }
    dialogVisible.value=true
  }else{
    curDefValue.value=(curDefValue.value || '' )+val
  }
  curSelValue.value=null
}

const saveCustomScript=()=>{
  dialogVisible.value=false
  curDefValue.value=customScriptVal.value
}
/** 初始化 */
onMounted(async () => {
  
})
</script>
<style scoped lang="scss">
.dialog-content{
  text-align: left;
}
</style>
<style lang="scss">
.def-value-tooltip{
  width: 350px;
}
</style>
