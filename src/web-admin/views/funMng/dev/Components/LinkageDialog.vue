<template>
  <Dialog title="联动配置(监听)" v-model="dialogVisible" width="1000" height="70vh">
    <div class="dialog-wrap" v-if="isLoad">
      <div class="left-wrap">
        <ul>
          <li
              v-for="(item, index) in formData"
              :class="curLinkageItem.linkageType === item.linkageType ? 'active' : ''"
              :key="'linkageItems_' + index"
              @click="changeLinkItem(item)"
            ><el-icon><SetUp /></el-icon>{{ item.linkageName }}</li
          >
        </ul>
      </div>
      <div class="right-content">
        <span style="font-size: 16px">【{{curLinkageItem.linkageName}}】联动配置</span>
        <div v-if="curLinkageItem.linkageType == 'fill'">
          <el-col :span="12">
            <el-form-item label="赋值为:">
              <component
                v-if="rowData.columnDisplayComponent"
                :is="rowData.columnDisplayComponent"
                v-bind="formItemProps"
                v-model="curLinkageItem.fillValue"
              >
              </component>
              <el-input
                v-else
                v-bind="formItemProps"
                v-model="curLinkageItem.fillValue">
              </el-input>
            </el-form-item>
          </el-col>
        </div>
        <div v-if="curLinkageItem.linkageType == 'changeInputType'">
          <el-col :span="12">
            <el-form-item label="切换为:">
              <SelectComponent
                style="width: 100%;"
                v-model="curLinkageItem.columnDisplayComponent"
                :show-label="curLinkageItem.columnDisplayComponentName"
                v-model:props-list="curLinkageItem.columnComponentAttributeDO"
              />
            </el-form-item>
          </el-col>
        </div>
        <div class="show-config-radio" :style="{
            top:['fill','changeInputType'].includes(curLinkageItem.linkageType)?'64px':'26px'
          }"
          v-if="activeName==='first'">
          <el-switch
            v-model="curLinkageItem.initConfig.setType"
            active-value="2"
            inactive-value="1"
            class="mb-2"
          />
          <span class="text">使用{{curLinkageItem.initConfig.setType===1?'表达式':'脚本'}}</span>
        </div>
        <div class="show-config-radio" :style="{
            top:['fill','changeInputType'].includes(curLinkageItem.linkageType)?'64px':'26px'
          }"
          v-if="activeName==='second'">
          <el-switch
            v-model="curLinkageItem.runConfig.setType"
            :active-value="2"
            :inactive-value="1"
            class="mb-2"
          />
          <span class="text">使用{{curLinkageItem.runConfig.setType===1?'表达式':'脚本'}}</span>
        </div>
        <el-tabs v-model="activeName" style="width: 100%;height:calc(100% - 31px);" class="tabs-wrap">
          <el-tab-pane label="初始化" name="first">
            <div v-if="curLinkageItem.initConfig.setType == 1">
              <AdvancedFilter v-model="curLinkageItem.initConfig.condition" :filter-fields="filterFieldList" />
            </div>
            <div v-if="curLinkageItem.initConfig.setType == 2" class="code-content">
              <CodeEditor v-model="curLinkageItem.initConfig.script" :initCode="initCode"></CodeEditor>
            </div>
          </el-tab-pane>
          <el-tab-pane label="运行时" name="second">
            <div v-if="curLinkageItem.runConfig.setType == 1">
              <AdvancedFilter v-model="curLinkageItem.runConfig.condition" :filter-fields="filterFieldList" />
            </div>
            <div v-if="curLinkageItem.runConfig.setType == 2" class="code-content">
              <CodeEditor v-model="curLinkageItem.runConfig.script" :initCode="initCode"></CodeEditor>
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
import { SetUp, Delete } from '@element-plus/icons-vue'
import AdvancedFilter from '@/components/AdvancedFilter/index.vue'
import {cloneDeep} from "lodash-es";
import {propTypes} from "@/utils/propTypes";
import SelectComponent from '@/web-admin/views/funMng/dev/Components/SelectComponent.vue'

const props=defineProps({
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
    initConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    },
    runConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    }
  },
  {
    linkageName: '显隐',
    icon: '',
    linkageType: 'hidden',
    initConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    },
    runConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    }
  },
  {
    linkageName: '禁用',
    icon: '',
    linkageType: 'disabled',
    initConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    },
    runConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    }
  },
  {
    linkageName: '加载数据',
    icon: '',
    linkageType: 'reloadData',
    initConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    },
    runConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    }
  },
  {
    linkageName: '赋值',
    icon: '',
    linkageType: 'fill',
    initConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    },
    runConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    }
  },
  {
    linkageName: '切换输入类型',
    icon: '',
    columnDisplayComponent:'',
    columnDisplayComponentName:'',
    columnComponentAttributeDO:[],
    linkageType: 'changeInputType',
    initConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    },
    runConfig: {
      setType: 1,
      condition: {
        operator: 'and',
        conditions: [],
        groups: []
      },
      script: ''
    }
  }
]
const formRef = ref()
const formData=ref()
const curLinkageItem = ref()
const changeLinkItem=async (item)=>{
  curLinkageItem.value=item
}
const initCode=` //上下文，可以获取页面的变量、组件、方法
 const ctx=context;
//itemConfig:字段配置参数；itemData:字段绑定值;rowData:行内按钮行内数据
 const ｛itemConfg,itemData,rowData｝=data;

 return true;
`
const filterFieldList=computed(()=>{
  return props.fieldList.map((item:any)=>{
    return {
      id: item.fieldId,
      type: 'formItem',
      label: item.columnComment,
      name: item.columnDisplayComponent || 'el-input',
      value: null,
      props: {
        dict:item.columnDictType,
        multiple:true,
        //...item.columnComponentAttributeDO,
        placeholder: '请输入'+item.columnComment,
        style: {
          width: '100%'
        }
      }
    }
  })
})

/** 打开弹窗 */
const isLoad=ref(false)
const rowData = ref({})
const open = async (type: string, data) => {
  dialogVisible.value = true
  formData.value=cloneDeep(linkageItemList)
  console.log('dddd',data)
  rowData.value = data
  getProps()
  if(data.pageLinkageRespVOS){
    formData.value=formData.value.map(item=>{
      const curData=data.pageLinkageRespVOS.find(childItem=>childItem.linkageType===item.linkageType)
      if(curData){
        return curData
      }else{
        return item
      }
    })
  }
  curLinkageItem.value=formData.value[0]
  isLoad.value=true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

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
  formItemProps.value = {...props}
}

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  let linkageConfig=null
  formData.value.forEach(item=>{
    if(item.initConfig.script || item.initConfig.condition.conditions.length || item.initConfig.condition.groups.length
    || item.runConfig.script || item.runConfig.condition.conditions.length || item.runConfig.condition.groups.length
    ){
      if(!linkageConfig){
        linkageConfig=[]
      }
      linkageConfig.push(item)
    }
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
}
.code-content{
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
</style>
