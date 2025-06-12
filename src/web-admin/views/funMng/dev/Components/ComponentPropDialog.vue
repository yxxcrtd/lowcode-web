<template>
  <Dialog :title="title" v-model="dialogVisible" width="900px">
    <div class="dialog-wrap">
      <el-form :model="form" ref="formRef" label-width="80">
        <el-row>
          <el-col :span="4" class="left-box">
            <el-form-item prop="componentName">
              <el-icon><Setting /></el-icon>
              <div class="componentName"> {{ form.componentName }}</div>
              <div class="componentCode">  {{ form.componentCode }}</div>
            </el-form-item>
            <!-- <el-form-item label="组件编码" prop="componentCode">
             
            </el-form-item> -->
          </el-col>
          <el-col :span="20" class="table-box">
            <el-form-item>
              <vxe-table border="inner" :data="form.attributeList" height="400">
                <vxe-column field="attributeName" title="属性名称" width="160">
                  <template #default="{ row }">
                    {{ row.attributeName }}
                  </template>
                </vxe-column>
                <vxe-column field="attributeCode" title="属性" width="160">
                  <template #default="{ row }">
                    {{ row.attributeCode }}
                  </template>
                </vxe-column>
                <vxe-column field="attributeType" title="属性类型" width="100">
                  <template #default="{ row }">
                    {{ row.attributeType }}
                  </template>
                </vxe-column>
                <vxe-column field="attributeValue" title="属性值">
                  <template #default="{ row, rowIndex }">
                    <el-form-item :prop="'attributeList[' + rowIndex + '].attributeValue'">
                      <template v-if="row.attributeType === 'Boolean'">
                        <el-switch v-model="row.attributeValue" inline-prompt active-text="是" active-value="true" inactive-text="否" inactive-value="false" />
                      </template>
                      <template v-else-if="row.attributeType == 'Dict'">
                        <BizSelectDict
                          v-model="row.attributeValue"
                          v-model:dict-name="row.attributeValueDictTypeName"
                        />
                      </template>
                      <template v-else-if="row.attributeType == 'User'">
                        <BizSelectUser v-model="row.attributeValue" multiple></BizSelectUser>
                      </template>
                      <template v-else-if="row.attributeType == 'Role'">
                        <BizSelectRole v-model="row.attributeValue" multiple></BizSelectRole>
                      </template>
                      <template v-else-if="row.attributeType == 'DictValue'">
                        <ace-select v-model="row.attributeValue" :dict="getDict" multiple></ace-select>
                      </template>
                      <template v-else-if="row.attributeType == 'ApiSys'">
                        <ace-select v-model="row.attributeValue" :data-source="apiSysOptions"></ace-select>
                      </template>
                      <template v-else-if="row.attributeType == 'rangeType'">
                        <ace-select v-model="row.attributeValue" :data-source="rangeTypeOptions"></ace-select>
                      </template>
                      <template v-else-if="row.attributeType == 'SelectTree'">
                        <BizSelectTrustTree v-model="row.attributeValue" :multiple="true"></BizSelectTrustTree>
                      </template>
                      <template v-else-if="row.attributeType == 'Script' || row.attributeType=='array'">
                        <JSONInput v-model="row.attributeValue"></JSONInput>
                      </template>
                      <template v-else>
                        <el-input v-model="row.attributeValue"></el-input>
                      </template>
                    </el-form-item>
                  </template>
                </vxe-column>
              </vxe-table>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-more-footer">
        <div class="left">
          <el-button type="primary" @click="clearCfg" link>清空配置</el-button></div>
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
import {getComponentByCode} from '../api'
import { Setting } from '@element-plus/icons-vue'
import BizSelectDict from "@/components-yt/biz/SelectDict/index.vue";
import BizSelectUser from "@/components-yt/biz/SelectUser/index.vue";
import BizSelectRole from "@/components-yt/biz/SelectRole/index.vue";
import BizSelectTrustTree from "@/components-yt/biz/SelectTrustTree/index.vue";
import JSONInput from "@/components/JsonInput/index.vue";
import {isArray} from "@/utils/is";
defineOptions({ name: 'ComponentPropsDialog1' })

const props=defineProps({
  dict:{
    type:String
  }
})
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formRef = ref()
const form = ref({
  id: null,
  componentName: '',
  componentCode: '',
  attributeList: [
    {
      id: null,
      pageId: null,
      priority: null,
      attributeId:'',
      attributeName: '',
      attributeCode: '',
      attributeType: '',
      attributeValue: null
    }
  ]
})
const title = ref<string>('组件属性设置')

/** 打开弹窗 */
const open = async (id, propsList,pageId,priority) => {
  console.log('恢复', propsList)
  const comRes = await getComponentByCode(id)
  console.log(comRes)
  form.value = {
    id: id,
    componentName: comRes.componentName,
    componentCode: comRes.componentCode,
    attributeList: comRes.componentAttributeList.map(item=>{
      return {
        pageId:pageId,
        priority:priority,
        attributeId:item.id,
        attributeName: item.attributeName,
        attributeCode: item.attributeCode,
        attributeType: item.attributeType,
        attributeValue: setDefValueMap[item.attributeType] && setDefValueMap[item.attributeType](item.attributeValue) || null
      }
    })
  }
  console.log(dialogVisible.value,'console.log(dialogVisible.value)')
  if (propsList && propsList.length) {
    form.value.attributeList.forEach((item) => {
      const isExitsItem = propsList.find((propItem) => propItem.attributeId === item.attributeId)
      if (isExitsItem  && isExitsItem.attributeValue) {
        item.id=isExitsItem.id
        item.attributeValue = formatValue(item.attributeType,isExitsItem.attributeValue)
      }
    })
  }
  dialogVisible.value = true
  console.log(dialogVisible.value)
}
const setDefValueMap={
  'Boolean':(attributeValue)=>{
    return attributeValue
  },
  'User':()=>{
    return []
  },
  'Role':()=>{
    return []
  },
  'DictValue':()=>{
    return []
  },
  'SelectTree':()=>{
    return []
  }
}
const formatValue=(attributeType,attributeValue)=>{
  if(attributeType=='User' || attributeType=='Role' || attributeType=='DictValue' || attributeType=='SelectTree'){
    return attributeValue && attributeValue.split(',') || []
  }else{
    return attributeValue
  }
}
const getDict=computed(()=>{
  if(props.dict){
    return props.dict
  }
  const dictItem=form.value.attributeList.find(item=>item.attributeType == 'Dict')
  if(dictItem){
    return dictItem.attributeValue
  }else{
    return null
  }
})
const apiSysOptions=[
  {label:'平台接口',value:'platform'},
  {label:'业务系统接口',value:'business-sys'},
]
const rangeTypeOptions=[
  {label:'当月',value:'curMonth'},
  {label:'当年',value:'curYear'},
  {label:'当日之后',value:'todayAfter'},
  {label:'当日之前',value:'todayBefore'},
]
const convertValue=(val)=>{
  if(isArray(val)){
    return val.join(',')
  }
  return val
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  const propsList = form.value.attributeList.filter(item=>item.attributeValue).map(item=>{
    return {
      id: item.id,
      attributeId:item.attributeId,
      attributeName: item.attributeName,
      attributeCode:item.attributeCode,
      attributeValue:convertValue(item.attributeValue),
      pageId : item.pageId,
      priority : item.priority
    }
  })
  emit('success', propsList.length > 0 ? propsList : null)
  dialogVisible.value = false
}
const clearCfg=()=>{

  emit('success', null)
  dialogVisible.value = false
}
</script>
<style lang="scss" scoped>
.dialog-wrap {
  width: 100%;
  min-height: 300px;
  :deep(.el-form-item__content){
    margin-left:  0 !important;
    display:block!important;
  }
}
.table-box{
  overflow-x:auto;
  position: relative;
  border-left:1px solid #dcdfe6;
  padding-left:15px;
}
:deep(.left-box){
  .el-icon{
  font-size: 16px;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 50%;
    margin-bottom: 10px;
   color: var(--el-color-primary);
   border: 1px solid var(--el-color-primary);
}
.el-form-item__content{
  text-align:center;
}
.componentName{
  font-size:16px;
}
.componentCode{
  font-size:12px;
}

}

</style>
