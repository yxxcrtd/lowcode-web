<template>
  <div class="condition-content">
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
        v-for="(sceneItem,index) in sceneList"
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
        </el-row>
        <div class="tab-filter-content" v-if="sceneItem.setType == 1">
          <AdvancedFilter v-model="sceneItem.condition" :filter-fields="filterFieldList" />
        </div>
        <div class="tab-edit-content" v-if="sceneItem.setType == 2">
          <CodeEditor v-model="sceneItem.script" :initCode="initCode" style="height:306px"></CodeEditor>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts" setup>
import { ref,nextTick } from 'vue'
import AdvancedFilter from '@/components/AdvancedFilter/index.vue'
import {propTypes} from "@/utils/propTypes";
import {Plus, WarningFilled} from "@element-plus/icons-vue";
import {cloneDeep} from "lodash-es";

defineOptions({ name: 'ConditionDialog' })

const props=defineProps({
  modelValue:propTypes.array,
  fieldList:propTypes.array
})

const sceneBase={
  type:'INIT',
  setType: '1',
  fillValue:'',//赋值
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

const message = useMessage() // 消息弹窗

const emit = defineEmits(['update:modelValue'])

const sceneList=computed({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    console.log('val',val)
    emit('update:modelValue', val)
  }
})


const sceneTabsValue=ref('scene-0')

const initCode=`function customEvent(formData,renderUtil){
    //formData 表单信息
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】
    //或具体结构【formData['1894191348934537217']['PROJECT_NAME_1894191348934537217']】格式
    //渲染引擎公共方法库
    console.log('customEvent',ctx,fieldConfig,formData)
    return true
}
`
/**
 * 新增、删除场景
 * @param targetName
 * @param action
 * @param index
 */
const handleSceneTabsEdit=(targetName,action,index)=>{
  if (action === 'add') {
    sceneList.value.push(cloneDeep(sceneBase))
    sceneTabsValue.value = 'scene-'+(sceneList.value.length-1)
  } else if (action === 'remove') {
    sceneList.value.splice(index,1)
    sceneTabsValue.value = 'scene-'+(index-1)
  }
}

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
onMounted(() => {
  console.log('props.modelValue',props.modelValue)
  if(props.modelValue && props.modelValue.length){
    sceneList.value=props.modelValue
  }else{
    sceneList.value=[cloneDeep(sceneBase)]
  }
})
</script>
<style lang="scss" scoped>
.condition-content{
  position: relative;
  width: 100%;

  :deep(.el-tabs__new-tab){
    border:none;
    width: 97px;
  }
  :deep(#tab-scene-0){
    .is-icon-close{
      display: none !important;
    }
  }
}
</style>
