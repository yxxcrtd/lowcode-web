<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1000" height="70vh">
    <div class="dialog-wrap" v-if="isLoad">
      <div class="left-wrap">
        <ul>
          <li
              v-for="(item, index) in formData"
              :class="curLinkageItem.linkageType === item.linkageType ? 'active' : ''"
              :key="'linkageItems_' + index"
              @click="changeLinkItem(item)"
            >
            <div class="linkage-li-content">
              <div class="title">{{ item.linkageName }}
                <el-icon v-if="checkSelect(item)"><Select /></el-icon>
              </div>
              <el-icon class="active-icon"><CaretRight /></el-icon>
            </div>
          </li
          >
        </ul>
      </div>
      <div class="right-content">
        <el-tabs
          v-model="sceneTabsValue"
          type="card"
          editable
          @edit="handleSceneTabsEdit"
        >
          <template #add-icon>
            <el-button :icon="Plus" size="small">新增场景</el-button>
          </template>
          <el-tab-pane
            v-for="(sceneItem,index) in curLinkageItem.sceneList"
            :key="'linkage-scene-'+index"
            :label="'场景'+(index+1)"
            :name="'scene-'+index"
          >
            <el-row>
              <el-col :span="12">
                <el-form-item>
                  <template #label>
                    <div class="custom-form-label">
                      <el-tooltip
                        popper-class="tooltips"
                        content="分为初始化、运行时，初始化会在页面加载时执行，运行时会在页面操作时执行"
                        placement="top-start"
                      >
                        <el-icon class="form-label-tips-icon"><WarningFilled /></el-icon>
                      </el-tooltip>
                      运行时机：
                    </div>
                  </template>
                  <el-radio-group v-model="sceneItem.type">
                    <el-radio value="INIT">初始化</el-radio>
                    <el-radio value="RUN">运行时</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="配置方式:">
                  <el-radio-group v-model="sceneItem.setType">
                    <el-radio value="1">表达式</el-radio>
                    <el-radio value="2">脚本</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="curLinkageItem.linkageType == 'fill'">
                <el-form-item label="赋值为:">
                  <component
                    v-if="rowData.columnDisplayComponent"
                    :is="rowData.columnDisplayComponent"
                    v-bind="formItemProps"
                    v-model="sceneItem.fillValue"
                  >
                  </component>
                  <el-input
                    v-else
                    v-bind="formItemProps"
                    v-model="sceneItem.fillValue">
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="curLinkageItem.linkageType == 'changeInputType'">
                <el-form-item label="切换为:">
                  <SelectComponent
                    style="width: 100%;"
                    v-model="sceneItem.columnDisplayComponent"
                    :show-label="sceneItem.columnDisplayComponentName"
                    v-model:props-list="sceneItem.columnComponentAttributeDO"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <div class="tab-filter-content" v-if="sceneItem.setType == 1">
              <AdvancedFilter v-model="sceneItem.condition" :filter-fields="filterFieldList" />
            </div>
            <div class="tab-edit-content" v-if="sceneItem.setType == 2">
              <CodeEditor v-model="sceneItem.script" :initCode="initCode"></CodeEditor>
            </div>
          </el-tab-pane>
        </el-tabs>
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
import ExpressionConfig from './ExpressionConfig.vue'
import {Plus, CaretRight, WarningFilled,Select} from '@element-plus/icons-vue'
import AdvancedFilter from '@/components/AdvancedFilter/index.vue'
import {cloneDeep} from "lodash-es";
import {propTypes} from "@/utils/propTypes";
import SelectComponent from '@/web-admin/views/funMng/dev/Components/SelectComponent.vue'

const props=defineProps({
  defLinkType:propTypes.array,
  fieldList:propTypes.array.def([])
})

defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const activeName = ref('first')
const dialogVisible = ref(false)
const linkageItemList = [
  {
    linkageName: '必填',
    icon: '',
    linkageType: 'require',
    sceneList:[]
  },
  {
    linkageName: '显隐',
    icon: '',
    linkageType: 'hidden',
    sceneList:[]
  },
  {
    linkageName: '禁用',
    icon: '',
    linkageType: 'disabled',
    sceneList:[]
  },
  {
    linkageName: '加载数据',
    icon: '',
    linkageType: 'reloadData',
    sceneList:[]
  },
  {
    linkageName: '赋值',
    icon: '',
    linkageType: 'fill',
    sceneList:[]
  },
  {
    linkageName: '切换输入类型',
    icon: '',
    linkageType: 'changeInputType',
    sceneList:[]
  }
]
const sceneBase={
  type:'INIT',
  setType: '1',
  fillValue:null,//赋值
  columnDisplayComponent:'',//切换输入类型
  columnDisplayComponentName:'',//切换输入类型
  columnComponentAttributeDO:[],//切换输入类型
  condition: {
    operator: 'and',
    conditions: [],
    groups: []
  },
  script: ''
}
const formRef = ref()
const formData=ref()
const curLinkageItem = ref()
const sceneTabsValue=ref('scene-0')
const dialogTitle=computed(()=>{
  return '联动配置(监听)-'+curLinkageItem.value?.linkageName
})

const changeLinkItem=async (item)=>{
  curLinkageItem.value=item
  sceneTabsValue.value='scene-0'
}
const checkSelect=(item)=>{
  return item.sceneList?.some(sceneItem=>{
    return sceneItem.script || sceneItem.condition.conditions.length || sceneItem.condition.groups.length
  })
}
const initCode=`function customEvent(ctx,fieldConfig,formData,renderUtil){
    //ctx为页面上下文
    //fieldConfig 字段配置参数
    //formData 表单信息
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】
    //或具体结构【formData['1894191348934537217']['PROJECT_NAME_1894191348934537217']】格式
    //渲染引擎公共方法库
    console.log('customEvent',ctx,fieldConfig,formData)
    return true
}
`
const filterFieldList=computed(()=>{
  return props.fieldList.map((item:any)=>{
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
const isLoad=ref(false)
const rowData = ref({})
const open = async (type: string, data) => {
  dialogVisible.value = true
  formData.value=cloneDeep(linkageItemList)
  if(props.defLinkType){
    formData.value=formData.value.filter(item=>props.defLinkType.includes(item.linkageType))
  }
  rowData.value = data
  getProps()
  formData.value=formData.value.map(item=>{
    const curData=data.pageLinkageRespVOS?.find(childItem=>childItem.linkageType===item.linkageType)
    if(curData){
      return curData
    }else{
      item.sceneList.push(cloneDeep(sceneBase))
      return item
    }
  })
  curLinkageItem.value=formData.value[0]
  isLoad.value=true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗


const handleSceneTabsEdit=(targetName,action,index)=>{
  if (action === 'add') {
    curLinkageItem.value.sceneList.push(cloneDeep(sceneBase))
    sceneTabsValue.value = 'scene-'+(curLinkageItem.value.sceneList.length-1)
  } else if (action === 'remove') {
    curLinkageItem.value.sceneList.splice(index,1)
    sceneTabsValue.value = 'scene-'+(index-1)
  }
}
/**
 * 组装字段组件-赋值模式
 */
const formItemProps = ref({})
const getProps = () => {
  const props = {}
  props['dict'] = rowData.value.columnDictType
  if(rowData.value.columnComponentAttributeDO && rowData.value.columnComponentAttributeDO.length>0){
    rowData.value.columnComponentAttributeDO.forEach(prop => {
      if(prop.attributeCode !== 'disabled'){
        props[prop.attributeCode] = prop.attributeValue
      }
    })
  }
  if(props.multiple){
    props.isJoin=true
  }
  formItemProps.value = {...props}
}

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  let linkageConfig=formData.value.filter(item=>{
    return item.sceneList.some(sceneItem=>{
      return sceneItem.script || sceneItem.condition.conditions.length || sceneItem.condition.groups.length
    })
  })
  emit('success', cloneDeep(linkageConfig))
  dialogVisible.value = false
  isLoad.value=false
}

onMounted(() => {})
</script>
<style lang="scss" scoped>
.dialog-wrap {
  display: flex;
  .left-wrap {
    width: 152px;
    height: 420px;
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
      .active-icon{
        display: none;
      }
      .active {
        background: #edf1ff;
        color: #409eff;
        cursor: pointer;
        .active-icon{
          display: block;
        }
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
.right-content{
  position: relative;
  width:100%;
  .show-config-radio{
    position: absolute;
    right: 12px;
    top: 26px;
    display: flex;
    align-items: center;
    z-index:999;
    .text{
      display: inline-block;
      line-height: 16px;
      height: 24px;
      margin-left: 10px;
    }
  }
  :deep(.el-tabs__new-tab){
    width: 80px;
  }
}
.tab-filter-content{
  background: #f9f9f9;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
  height:300px;
  overflow: auto;
  :deep(.filter-container){
    background: transparent !important;
  }
}
.tab-edit-content{
  height: 333px;
  width: 803px;
}
:deep(.el-form-item--default){
  margin-bottom: 0px;
  margin-top: 5px;
}
:deep(.component-container){
  width: 100%;
  align-items: end;
}
.tabs-wrap{
  padding: 5px;
  :deep(.el-tab-pane){
    overflow-y: auto;
    height: auto;
    max-height: 400px;
  }
}
.linkage-li-content{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:deep(#tab-scene-0){
  .is-icon-close{
    display: none !important;
  }
}
</style>
