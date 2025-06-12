<template>
  <Dialog title="数据转换" v-model="dialogVisible" width="800">
    <div class="dialog-content">
      <el-form :model="formData" ref="formRef" label-width="110">
        <el-form-item label="转换类型" prop="dataType">
          <el-select
            v-model="formData.dataType"
            placeholder="请选择转换类型"
          >
            <el-option
              v-for="item in convertOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据字典" prop="dataContent" v-if="formData.dataType==='dict'">
          <el-select
            v-model="formData.dataContent"
            placeholder="请选择字典"
          >
            <el-option
              v-for="item in dictOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="正则表达式" prop="dataRegular" v-if="formData.dataType==='regular'">
          <el-input v-model.number="formData.dataRegular" />
        </el-form-item>
        <el-form-item label="脚本" prop="dataScript" v-if="formData.dataType==='script'">
          <CodeEditor v-model="formData.dataScript" :initCode="initCode"></CodeEditor>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-more-footer">
        <div class="left">
          <el-button type="primary" @click="clearCfg" link>清空配置</el-button></div>
        <div class="right">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button></div>
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import {cloneDeep} from "lodash-es";
import {getDictTypeList} from "../api"

defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formRef = ref()
const formData = ref({
  dataType: '',
  dataContent: '',
  dataRegular: '',
  dataScript: '',
})
const convertOption=reactive([
  {label:"字典转换",value:"dict"},
  {label:"正则转换",value:"regular"},
  {label:"自定义转换",value:"script"}
])
const initCode=` //上下文，可以获取页面的变量、组件、方法
 const ctx=context;
//itemConfig:字段配置参数；itemData:字段绑定值;rowData:行内按钮行内数据
 const ｛itemConfg,itemData,rowData｝=data;
 
 return true;
`
const dictOptions=ref([])
const getDictOption=async ()=>{
  const param={
    pageNo:1,
    pageSize:100,
  }
  const res=await getDictTypeList(param)
  dictOptions.value=res.list.map(item=>{
    return {
      label:item.name,
      value:item.type
    }
  })
}
getDictOption()
/** 打开弹窗 */
const open = async (type: string, data) => {
  formData.value={
    dataType: '',
    dataContent: '',
    dataRegular: '',
    dataScript: '',
  }
  dialogVisible.value = true
  if(data){
    formData.value=data
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  dialogVisible.value = false
  emit('success',cloneDeep(formData.value))
}
const clearCfg=()=>{
  dialogVisible.value = false
  emit('success',null)
}
</script>
<style lang="scss" scoped>
.dialog-content{
  height: 368px;
}
</style>
