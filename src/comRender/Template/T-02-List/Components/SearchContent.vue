<template>
  <div class="search-content" v-if="isHaveSearch">
    <div class="search-items">
      <el-form
        class="-mb-15px"
        :model="formData"
        ref="queryFormRef"
        label-width="auto"
      >
        <el-row>
          <el-col :span="8" v-for="(formItem, index) in formItemList" :key="'listPage_Search_'+index">
            <el-form-item :label="formItem.label" :prop="formItem.field" :rules="formItem.rules">
              <component
                :is="formItem.columnDisplayComponent"
                v-model="formData[formItem.field]"
                v-bind="formItem.props"
              >
              </component>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="search-action">
      <el-button type="primary" @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
      <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref,inject} from 'vue'
import {setFormItem,assemblySearchField} from '../js/search'

const queryForm = defineModel()
const formData=ref({})

const pageInfo:any = inject('pageInfo')
const apiInfo=pageInfo.pageApiRespVOS.find(item=>item.apiCode==='page-list')

//组装表单项
const formItemList = ref(setFormItem(apiInfo,formData))

/**
 * 判断是否存在搜索框，无搜索框不显示
 */
const isHaveSearch=computed(()=>{
  return apiInfo.pageListConditions && apiInfo.pageListConditions.length
})

/**
 * 按钮事件处理
 */
const emits=defineEmits(["search","btnEvent"])
const handleQuery=async ()=>{
  queryForm.value=assemblySearchField(formData.value,apiInfo)
  await nextTick()
  emits("search",queryForm.value)
}
handleQuery()
const resetQuery=async ()=>{
  formData.value={}
  queryForm.value=[]
  emits("search",queryForm.value)
}

</script>


<style scoped lang="scss">
.search-content{
  background: #ffffff;
  box-shadow: 0 0 rgba(0, 0, 0, 0), 0 0 rgba(0, 0, 0, 0), 0 1px 3px 0 rgba(0, 0, 0, 0.1019607843), 0 1px 2px -1px rgba(0, 0, 0, 0.1019607843);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 10px;
  display: flex;
  .search-items{
    flex: 1;
    margin-right:10px
  }
  .search-action{
    position: relative;
    width: 118px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .el-button:nth-child(1){
      //margin-left: 10px !important;
      margin-bottom: 10px;
    }
    .el-button+.el-button {
      margin-left: 0px;
    }
    &::before{
      content: '';
      display: block;
      width: 1px;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0px;
      border-right: 1px solid #dbe1ef;
    }
  }
}
</style>
