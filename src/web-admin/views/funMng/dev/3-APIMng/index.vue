<template>
  <div class="api-container">
    <div class="btn-action" v-if="1==2">
      <el-dropdown>
        <el-button type="primary">
          新建服务<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>Java服务</el-dropdown-item>
            <el-dropdown-item>HTTP服务</el-dropdown-item>
            <el-dropdown-item>SQL服务</el-dropdown-item>
            <el-dropdown-item>JS服务</el-dropdown-item>
            <el-dropdown-item>服务编排</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <JVxeTable ref="jVxeTable" class="table-content" height="100%" :columns="columns" :row-height="58" :data-url="getModuleApiPageUrl" :search-params="queryParams">
      <template #action_default="{ row }">
        <div class="table-action">
          <el-link type="primary" @click="handleView(row)">查看</el-link>
          <!--        <el-divider direction="vertical" />-->
          <!--        <el-link type="primary" @click="handleEdit(row)">编辑</el-link>-->
          <!--        <el-divider direction="vertical" />-->
          <!--        <el-link type="primary">删除</el-link>-->
        </div>
      </template>
    </JVxeTable>
  </div>
  <ModelApiParam ref="modelApiParamRef"></ModelApiParam>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash-es'
import { columns } from './data'
import {propTypes} from "@/utils/propTypes";
import ModelApiParam from "./Components/ModelApiParam.vue"
import {getModuleApiPageUrl} from "./api";

defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const props=defineProps({
  modelValue:propTypes.object
});
const route = useRoute()
const menuId = route.query.id
const queryParams = reactive({
  menuId: menuId
})
const emit = defineEmits(['update:modelValue','close-click','changeMainTable'])
const formData = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})
const handleView=(row)=>{
  openParamDrawer('view',row)
}
const modelApiParamRef=ref()
const openParamDrawer=(type,row)=>{
  modelApiParamRef.value.open(type,row)
}
</script>

<style scoped lang="scss">
.api-container{
  height: calc(100vh - 160px);
  .table-content{
    height: calc(100vh - 150px);
  }
}
:deep(.vxe-body--row){
  height:58px;
}
</style>
