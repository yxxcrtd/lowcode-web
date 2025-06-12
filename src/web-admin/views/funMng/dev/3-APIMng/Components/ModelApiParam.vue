<template>
  <el-drawer v-model="drawerVisible" title="服务详情" size="900px">
    <el-row>
      <el-col>
        <el-form-item label="服务名称:">
          {{ apiInfo.serviceName }}
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item label="服务编码:">
          {{ apiInfo.serviceCode }}
        </el-form-item>
      </el-col>
    </el-row>
    <el-tabs v-model="activeName">
      <el-tab-pane label="入参" name="queryParams">
        <JVxeTable
          ref="jVxeTable"
          :columns="apiParamColumns"
          :row-height="58"
          style="height: calc(100vh - 290px)"
          height="auto"
          :data-source="queryParamsData"
          :tablePageConfig="{ enabled: false }"
        ></JVxeTable>
      </el-tab-pane>
      <el-tab-pane label="响应参数" name="responseParams">
        <JVxeTable
          ref="jVxeTable"
          :columns="apiParamColumns"
          :row-height="58"
          style="height: calc(100vh - 290px)"
          height="auto"
          :data-source="responseParamsData"
          :tablePageConfig="{ enabled: false }"
        ></JVxeTable>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>
<script lang="ts" setup>
import { apiParamColumns } from '../data'
import { getModuleApiParamInfo } from '../api'

defineOptions({ name: 'TaskSignList' })

const drawerVisible = ref(false) // 抽屉的是否展示
const apiParam = ref([])
const apiInfo:any = ref({})

/** 打开弹窗 */
const open = async (type, row) => {
  // 展开抽屉
  drawerVisible.value = true
  apiInfo.value = row
  loadApiInfo(row.id)
}
defineExpose({ open }) // 提供 openModal 方法，用于打开弹窗

const queryParamsData=ref([])
const responseParamsData=ref([])
const loadApiInfo = async (id) => {
  const res = await getModuleApiParamInfo(id)
  queryParamsData.value = res.filter(item=>item.paramType=='请求参数')
  responseParamsData.value = res.filter(item=>item.paramType=='响应参数')
}

const activeName=ref('queryParams')

</script>
<style scoped lang="scss">
:deep(.j-vxe-table){
  height: calc(100vh - 420px);
}
</style>
