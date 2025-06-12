<template>
  <div class="form-page-container">
    <RenderSlot
      :slot-path="pageInfo.headerSlot"
      :templateModule="slotModules"
      :template-path="templateModulePath"
      :instance="instance"
    ></RenderSlot>
    <template v-if="pageInfo.pageVersion=='v2'">
      <RenderFormV2 v-model="formData" ref="formRef" :form-layouts="apiInfo" :flow-node-info="flowNodeInfo" :isDetail="isDetail" @layout-success="layoutSuccess"
                    @change-flow="changeFlow"></RenderFormV2>
    </template>
    <template v-else>
      <RenderFormV1 v-model="formData" ref="formRef" :form-layouts="apiInfo" :flow-node-info="flowNodeInfo" :isDetail="isDetail" @layout-success="layoutSuccess"
                    @change-flow="changeFlow"></RenderFormV1>
    </template>
    <RenderSlot
      :slot-path="pageInfo.tailSlot"
      :templateModule="slotModules"
      :template-path="templateModulePath"
      :instance="instance"
    ></RenderSlot>
    <div class="foot-split"></div>
    <div class="fixed-footer">
      <template v-for="item in pageButtons">
        <el-popconfirm
          title="确定关闭页面吗？"
          width="200px"
          v-if="item.operationType === 'cancel'"
          :key="'cancel-btn' + item.buttonId"
          @confirm="handlePageButtons(item)"
        >
          <template #reference>
            <el-button>
              <Icon v-if="item.buttonIcon" :icon="item.buttonIcon" class="mr-5px" />
              {{ item.buttonName }}</el-button
            >
          </template>
        </el-popconfirm>
        <el-button v-else :type="item.buttonStyle" :key="item.buttonId" @click="handlePageButtons(item)">
          <Icon v-if="item.buttonIcon" :icon="item.buttonIcon" class="mr-5px" />
          {{ item.buttonName }}</el-button
        >
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { propTypes } from '@/utils/propTypes'
import request from '@/config/axios'
import { useTagsView } from '@/hooks/web/useTagsView'
import RenderFormV1 from '@/comRender/render/v1/Components/RenderForm/index.vue'
import RenderFormV2 from '@/comRender/render/v2/Components/RenderForm/index.vue'
import RenderSlot from '@/comRender/Components/RenderSlot/index.vue'
import {getFlowNodeCfg} from "@/comRender/api";
//定义模板页面api和参数
const templateAPI = ref([
  {
    apiCode: 'form-create',
    apiName: '新增'
  },
  {
    apiCode: 'form-update',
    apiName: '修改'
  },
  {
    apiCode: 'page-list',
    apiName: '详情'
  }
])

const props = defineProps({
  pageInfo: propTypes.object.def({}),
  flowNodeInfo:propTypes.object,
  dataId: propTypes.string
})
provide('pageInfo', props.pageInfo)
const instance = getCurrentInstance()
const apiInfo = props.pageInfo.pageApiRespVOS.find((item) => item.apiCode === 'form-create')

const message = useMessage()
const tag = useTagsView()

const route = useRoute()
const { pageType } = route.query

const formData = ref<any>(null)
const formRef = ref()

const isDetail = ref(pageType == 'detail')

/**
 * 编辑查询数据
 */
const loadEditData = async () => {
  const apiInfo = props.pageInfo.pageApiRespVOS.find((item) => item.apiCode === 'form-detail')
  let apiUrl = '/cfg/low-code-api/' + apiInfo.serverId
  const params = {
    serviceId: apiInfo.serverId,
    pageId: apiInfo.pageId,
    pageApiCode: apiInfo.apiCode,
    params: route.query
  }
  let res = await request.post({ url: apiUrl, data: params })
  formRef.value.initForm(res)
}
const changeFlow=async(flowId,nodeId)=>{
  console.log('changFlow',flowId,nodeId)
  //加载流程节点数据
  const params = {
    pageId: props.pageInfo.id,
    flowId:flowId,
    nodeId: nodeId
  }
  await getFlowNodeCfg(params)
}
//按钮点击事件
const handlePageButtons = async (btnItem) => {
  if (btnItem.operationType === 'cancel') {
    tag.closeCurrent()
    return
  }
  if (btnItem.operationType === 'save') {
    const valid = await formRef.value.validateForm()
    console.log(btnItem)
    let pageTemplateApi = pageType === 'edit' ? 'form-update' : 'form-create'
    const apiInfo = props.pageInfo.pageApiRespVOS.find((item) => item.apiCode === pageTemplateApi)
    const apiUrl = '/cfg/low-code-api/' + apiInfo.serverId
    const curFormData = formRef.value.getFormData()
    const params = {
      serviceId: apiInfo.serverId,
      pageId: apiInfo.pageId,
      pageApiCode: apiInfo.apiCode,
      params: curFormData
    }
    let res = await request.post({ url: apiUrl, data: params })
    console.log(res)
    message.success('保存成功')
    tag.closeCurrent()
  }
}

/**
 * 表单加载完成后再进行数据加载，否则可能会把加载数据覆盖
 */
const layoutSuccess = async () => {
  if (['edit', 'detail'].includes(pageType)) {
    await loadEditData()
  }
  //加载默认数据
  formRef.value.loadDataOver()
}


/**
 * 加载插槽组件
 *
 */
let slotModules = import.meta.glob('@/comRenderPlugins/**/**/*.vue')
const templateModulePath = ref('/src/comRenderPlugins')

const pageButtons = ref([])
onMounted(async () => {
  const cancelBtn = props.pageInfo.pageButtons.find(item => item.operationType === 'cancel')
  pageButtons.value = (cancelBtn?[cancelBtn]:[]).concat(props.pageInfo.pageButtons.filter(item => item.operationType !== 'cancel'))
})
</script>

<style scoped lang="scss">
.form-page-container {
  padding: 0 15px 0 5px;
}
.fixed-footer {
  position: absolute;
  background: #fff;
  width: calc(100% - 40px);
  height: 50px;
  z-index: 99;
  box-shadow: 0 -5px 5px -5px rgba(0, 0, 0, 0.5);
  text-align: left;
  left: 0;
  bottom: 0px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.foot-split {
  height: 80px;
}
.formPage {
  border-bottom: none;

  :deep(.el-collapse-item) {
    background-color: #f5f6f7;
  }
  :deep(.el-collapse-item__header) {
    padding-left: 24px;
    padding-right: 16px;
    position: relative;
    border-bottom: 1px solid #f0f2f5;
    color: #1d2129;
    font-size: 16px;
  }
  :deep(.el-collapse-item__header::before) {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 45%;
    // border-radius: 0 2px 2px 0;
    background-color: #409eff;
  }
  :deep(.el-collapse-item__wrap) {
    padding-left: 24px;
    padding-right: 16px;
  }
  :deep(.el-collapse-item__wrap) {
    padding-top: 24px;
    border-bottom: none;
    padding-bottom: 24px;
  }
  :deep(.el-collapse-item__content) {
    padding-bottom: 0;
  }
  :deep(.el-collapse-item) {
    margin-bottom: 15px;
  }
  :deep(.el-collapse-item:last-child) {
    margin-bottom: 0;
  }
  :deep(.vxe-table--body .el-form-item--default) {
    margin-bottom: 0;
  }
}
</style>
