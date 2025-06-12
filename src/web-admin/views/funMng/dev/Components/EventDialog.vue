<template>
  <Dialog title="事件配置(事件触发)" style="margin-top: 50px;" v-model="dialogVisible" width="1600">
    <div class="dialog-wrap">
      <div class="left-wrap">
        <ul>
          <li
v-for="(item, index) in formData"
              :class="curIndex===index ? 'active' : ''"
              :key="'linkageItems_' + index"
              @click="changeLinkItem(index)"
          ><el-icon><SetUp /></el-icon>{{ item.eventName }}</li
          >
        </ul>
      </div>
      <div style="width: 100%" v-loading="isLoad">
        <div style="font-size: 16px" class="mb-10px">【{{formData[curIndex].eventName}}】事件配置</div>
        <div class="code-content">
          <MonacoEditor v-model="formData[curIndex].script" :initCode="initCode" :filterFields="filterFieldList"></MonacoEditor>
        </div>
      </div>
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
import { SetUp, Delete } from '@element-plus/icons-vue'
import {cloneDeep} from "lodash-es";
import {propTypes} from "@/utils/propTypes";

const props=defineProps({
  fieldList:propTypes.array.def([])
})
defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const linkageItemList = ref([
  {
    eventName: '值变化时',
    icon: '',
    eventType: 'change',
    script: '',
  },
  {
    eventName: '输入时',
    icon: '',
    eventType: 'keyup',
    script: ''
  },
  {
    eventName: '获取焦点时',
    icon: '',
    eventType: 'focus',
    script: ''
  },
  {
    eventName: '失去焦点时',
    icon: '',
    eventType: 'blur',
    script: ''
  },
])
const initCode=ref(`function handleEvent(ctx,fieldConfig,formData,data,renderUtil){
    //ctx为页面上下文
    //fieldConfig 当前字段的配置信息
    //data 当前组件事件返回的数据
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】或
    //具体结构【formData['1894191348934537217']['PROJECT_NAME_1894191348934537217']】格式
    console.log('change',ctx,fieldConfig,formData,data)
}
`)
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
const filterFieldList=computed(()=>{
  console.log(props.fieldList,'props.fieldList---');
  
  return props.fieldList.map((item:any)=>{
    const {component,multiple}=getFilterFieldComponent(item.columnDisplayComponent)
    return {
      id: item.fieldId,
      type: 'formItem',
      label: item.columnComment,
      tableId:item.tableId,
      tableName:item.tableComment,
      columnName:item.columnName,
      name: component,
      value: null,
      props: {
        ...getFilterFieldProps(item),
        multiple:multiple,
        //...item.columnComponentAttributeDO,
        placeholder: '请输入'+item.columnComment,
        style: {
          width: '100%'
        }
      }
    }
  })
})

const formRef = ref()
const formData = ref([])
const curIndex=ref(0)
const isLoad=ref(false);
const changeLinkItem=async (index)=>{
  curIndex.value=index
}

/** 打开弹窗 */
const open = async (data,isChildTable) => {
  dialogVisible.value = true
  formData.value=cloneDeep(linkageItemList.value)
  if(isChildTable){
    initCode.value=`function handleEvent(ctx,fieldConfig,row,data,renderUtil){
    //ctx为页面上下文
    //fieldConfig 当前字段的配置信息
    //data 当前组件事件返回的数据
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】或
    //具体结构【row[1894191348934537217][PROJECT_NAME_1894191348934537217]】格式
    console.log('change',ctx,fieldConfig,row,data)
}
`
  }
  if(data){
    formData.value=formData.value.map(item=>{
      const dataItem=data.find(childItem=>childItem.eventType===item.eventType)
      if(dataItem){
        return dataItem
      }else{
        return item
      }
    })
  }
  curIndex.value=0
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  const params=formData.value.filter(item=>item.script)
  emit('success',cloneDeep(params))
  dialogVisible.value=false
}
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
        margin-bottom:4px;
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
.code-content{
  width: 100%;
  height: calc(100% - 39px);
}
</style>
