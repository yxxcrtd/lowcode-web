<template>
  <Dialog title="条件配置" v-model="dialogVisible" width="700">
    <div class="dialog-wrap">
      <el-form :model="formData" ref="formRef" label-width="120">
        <el-form-item label="显示类型" prop="showPageType">
          <el-checkbox-group v-model="formData.showPageType">
            <el-checkbox value="add-page" label="发起页面"></el-checkbox>
            <el-checkbox value="edit-page" label="审批页面"></el-checkbox>
            <el-checkbox value="detail-page" label="已办、详情页面"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="配置方式" prop="setType">
          <el-radio-group v-model="formData.setType">
            <el-radio value="1">配置</el-radio>
            <el-radio value="2">自定义脚本</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="condition" label-width="50" v-if="formData.setType == '1'">
          <AdvancedFilter v-model="formData.condition" :filter-fields="filterFieldList" />
        </el-form-item>
        <el-form-item prop="script" label-width="50" v-if="formData.setType == '2'">
          <CodeEditor v-model="formData.script" type="textarea" :rows="4" :initCode="initCode"></CodeEditor>
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
import { ref,nextTick } from 'vue'
import AdvancedFilter from '@/components/AdvancedFilter/index.vue'
import {cloneDeep} from "lodash-es";
import {propTypes} from "@/utils/propTypes";

defineOptions({ name: 'ConditionDialog' })
const props=defineProps({
  fieldList:propTypes.array.def([])
})

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const tableId=ref(null)
const formRef = ref()
const formData=ref({
  showPageType:['add-page','edit-page','detail-page'],
  setType: '1',
  condition: {
    operator: 'and',
    conditions: [],
    groups: []
  },
  script: ''
})
const initCode=`function customEvent(ctx,formData,row,rowIndex,renderUtil){
    //ctx 表格分组的上下文
    //formData 表单信息
    //formData为当前表单数据,具体结构【formData['1894191348934537217']['PROJECT_NAME_1894191348934537217']】
    //row 行内数据
    //渲染引擎公共方法库
    console.log('customEvent',ctx,formData,row)
    return true
}
`
const filterFieldList=computed(()=>{
  return props.fieldList.filter((item:any)=>tableId.value ? tableId.value==item.moduleTableId : item.moduleTableId).map((item:any)=>{
    const {component,multiple}=getFilterFieldComponent(item.columnDisplayComponent)
    return {
      id: item.fieldId,
      type: 'formItem',
      label: item.columnComment,
      tableId:item.tableId,
      tableName:item.tableComment,
      name: component,
      value: null,
      props: {
        ...getFilterFieldProps(item),
        dict:item.columnDictType,
        multiple:multiple,
        placeholder: '请输入'+item.columnComment,
        style: {
          width: '100%'
        }
      }
    }
  })
})


const getFilterFieldComponent=(oriComponent)=>{
  let component=oriComponent
  let multiple=true
  if(!oriComponent){
    component= 'el-input'
  }
  if(['ace-check-box','ace-radio'].includes(oriComponent)){
    component= 'ace-select'
    multiple=true
  }
  return {component,multiple}
}

const getFilterFieldProps = (item) => {
  const props = {}
  props['dict'] = item.columnDictType
  if(item.columnComponentAttributeDO && item.columnComponentAttributeDO.length>0){
    item.columnComponentAttributeDO.forEach(prop => {
      if(prop.attributeCode !== 'disabled'){
        props[prop.attributeCode] = prop.attributeValue
      }
    })
  }
  // if(props.multiple){
  //   props.isJoin=true
  // }
  return props
}
/** 打开弹窗 */
const open = async (data,moduleTableId) => {
  formData.value={
    showPageType:['add-page','edit-page','detail-page'],
    setType: '1',
    condition: {
      operator: 'and',
      conditions: [],
      groups: []
    },
    script: ''
  }
  dialogVisible.value = true
  if(data){
    formData.value=Object.assign(formData.value,cloneDeep(data))
  }
  //判断是否表格内按钮
  tableId.value=moduleTableId
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  message.success('提交成功！')
  dialogVisible.value = false
  emit('success',cloneDeep(formData.value))
}
onMounted(() => {})
</script>
<style lang="scss" scoped>
.dialog-wrap {
  height: 358px;
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
