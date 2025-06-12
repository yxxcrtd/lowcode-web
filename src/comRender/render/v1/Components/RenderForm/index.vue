<template>
  <div class="form-render-container" v-loading="!isLoadPage" element-loading-text="加载页面中...">
    <el-collapse v-model="activeNames" class="formPage" v-if="isLoadPage">
      <el-form :model="renderFormData" ref="formRef" v-bind="renderFormProps">
        <template v-for="(groupItem, index) in formGroups" :key="groupItem.groupCode + '_' + index">
          <el-collapse-item
            :class="'render-form-group-' + groupItem.groupCode"
            :title="groupItem.groupName"
            :name="groupItem.groupCode"
            v-if="checkGroupHidden(groupItem)"
          >
            <GroupTipsContent
              :renderFormData="renderFormData"
              :formLayouts="formLayouts"
              :instance="instance"
              :name="groupItem.groupCode + 'head'"
              :groupTips="groupItem.groupHeadTips"
              :flowNodeInfo="flowNodeInfo"
              v-if="groupItem.groupHeadTips"
            ></GroupTipsContent>
            <template v-if="groupItem.groupSlot">
              <RenderSlot
                :slot-path="groupItem.groupSlot"
                :instance="instance"
                :groupItem="groupItem"
                :formGroups="formGroups"
                :flowNodeInfo="flowNodeInfo"
                v-model="renderFormData"
                :isDetail="isDetail"
              ></RenderSlot>
            </template>
            <el-row v-else :gutter="10">
              <template v-for="(formItem, formItemIndex) in groupItem.formItems">
                <el-col
                  :span="getColSpan(formItem)"
                  :key="formItem.columnName + '_' + formItemIndex"
                  v-if="!formItem.isHidden"
                >
                  <template v-if="formItem.isTableItem">
                    <FormListItem
                      v-if="formItem.tableConfig.editMode == 'form'"
                      v-model="renderFormData"
                      :instance="instance"
                      :formItem="formItem"
                      :groupItem="groupItem"
                      :formTableProps="formTableProps"
                      :isDetail="isDetail"
                    ></FormListItem>
                    <FormTableItem
                      v-else
                      v-model="renderFormData"
                      :instance="instance"
                      :formItem="formItem"
                      :groupItem="groupItem"
                      :formTableProps="formTableProps"
                      :flowNodeInfo="flowNodeInfo"
                      :isDetail="isDetail"
                      @btnEvent="handleBtnClick"
                    />
                  </template>
                  <template v-else>
                    <el-form-item
                      :label-width="formItem.columnHeadWidth ? formItem.columnHeadWidth + 'px' : '180px'"
                      :prop="formItem.moduleTableId + '.' + formItem.field"
                      :rules="formItem.rules"
                      for="-"
                    >
                      <template #label>
                        <FormItemLabel :label="formItem.columnComment" :tips="formItem.columnHeadTips"></FormItemLabel>
                      </template>
                      <!--渲染详情-->
                      <FormItemDetail
                        v-if="(isDetail || formItem.isDisabled) && !formItem.columnSlot"
                        :value="renderFormData[formItem.moduleTableId][formItem.labelField]"
                        :fieldConfig="formItem"
                        :formData="renderFormData"
                        :formGroups="formGroups"
                        :componentType="formItem.columnDisplayComponent"
                        :component-props="formItem.props"
                      >
                      </FormItemDetail>
                      <!--渲染插槽-->
                      <RenderSlot
                        v-else-if="formItem.columnSlot"
                        :slot-path="formItem.columnSlot"
                        :formGroups="formGroups"
                        :formItem="formItem"
                        :flowNodeInfo="flowNodeInfo"
                        v-model="renderFormData[formItem.moduleTableId][formItem.field]"
                        v-model:form-data="renderFormData"
                        :isDetail="isDetail || formItem.isDisabled"
                      ></RenderSlot>
                      <!--渲染组件-->
                      <component
                        v-else
                        :is="formItem.columnDisplayComponent"
                        v-bind="formItem.props"
                        v-model="renderFormData[formItem.moduleTableId][formItem.field]"
                        v-model:modelText="renderFormData[formItem.moduleTableId][formItem.fieldText]"
                        v-model:startDate="renderFormData[formItem.moduleTableId][formItem.startDateField]"
                        v-model:endDate="renderFormData[formItem.moduleTableId][formItem.endDateField]"
                        :disabled="isDetail || formItem.isDisabled"
                        :pageListConfigs="apiInfo.pageListConfigs"
                        :formGroups="formGroups"
                        :formData="isTableItem ? tableFormMainData : renderFormData"
                        @change="(val, option) => handleComponentEvent('change', formItem, { val, option })"
                        @keyup="(e) => handleComponentEvent('keyup', formItem, { e })"
                        @focus="(e) => handleComponentEvent('focus', formItem, { e })"
                        @blur="(e) => handleComponentEvent('blur', formItem, { e })"
                      >
                      </component>
                    </el-form-item>
                  </template>
                </el-col>
              </template>
              <template v-if="groupItem.children && groupItem.children.length">
                <el-col :span="24">
                  <ChildrenGroupItem
                    v-model="renderFormData"
                    :groupItems="groupItem.children"
                    :instance="instance"
                    :isDetail="isDetail"
                    :page-info="pageInfo"
                    :form-table-props="formTableProps"
                  ></ChildrenGroupItem>
                </el-col>
              </template>
            </el-row>
            <template v-if="groupItem.groupFailSlot">
              <RenderSlot
                :slot-path="groupItem.groupFailSlot"
                :instance="instance"
                :groupItem="groupItem"
                :formGroups="formGroups"
                v-model="renderFormData"
                :flowNodeInfo="flowNodeInfo"
                :isDetail="isDetail"
              ></RenderSlot>
            </template>
            <!--            加入提示文本-->
            <template v-if="groupItem.groupTips">
              <div class="tips-div normal-tip">{{ `${groupItem.groupTips}` }}</div>
            </template>
            <!--            加入链接-->
            <template v-if="groupItem.groupLinkName">
              <div class="normal-tip">
                <el-link type="primary" underline @click="handleLink(groupItem)" :icon="Link">{{
                  groupItem.groupLinkName
                }}</el-link>
              </div>
            </template>
            <GroupTipsContent
              :renderFormData="renderFormData"
              :formLayouts="formLayouts"
              :instance="instance"
              :name="groupItem.groupCode + 'foot'"
              :groupTips="groupItem.groupFootTips"
              v-if="groupItem.groupFootTips"
              :flowNodeInfo="flowNodeInfo"
            ></GroupTipsContent>
            <!-- <GroupTipsContent v-if="groupItem.groupFootTips">{{groupItem.groupFootTips}}</GroupTipsContent> -->
          </el-collapse-item>
        </template>
        <el-collapse-item
          class="render-form-attach-group"
          v-if="!isTableItem && pageInfo.isSupportAttachment == 1 && pageInfo.attachmentInfo"
          title="附件"
          name="attach"
        >
          <FlowAttachment
            ref="attachmentTableRef"
            :isDetail="isDetail"
            :attachmentInfo="pageInfo.attachmentInfo"
            :flowNodeInfo="flowNodeInfo"
            v-model="renderFormData.attachmentList"
          />
        </el-collapse-item>
      </el-form>
    </el-collapse>
    <open-by-drawer ref="openDrawer"></open-by-drawer>
    <open-by-dialog ref="openDialog"></open-by-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, inject } from 'vue'
import {
  initAttacementInfo,
  initFormData,
  initTableFormData,
  setGroupFormItem,
  updateFormItemByFlow,
  scrollToDom,
  setAttachmentGroup
} from './js/index'
import { setDefValue } from './js/defaultValue'
import { formLinkage } from '@/comRender/render/v1/Core/linkage/batchRunLinkage'
import { preLoadComponentData } from './js/components'
import { propTypes } from '@/utils/propTypes'
import FormTableItem from './FormTableItem.vue'
import FormListItem from './FormListItem.vue'
import { handleEvent, customEvent } from '@/comRender/render/v1/Core/event'
import { cloneDeep } from 'lodash-es'
import RenderSlot from '@/comRender/Components/RenderSlot/index.vue'
import FlowAttachment from '@/components-yt/biz/Attachment/FlowAttachment.vue'
import FormItemDetail from './Components/FormItemDetail.vue'
import FormItemLabel from './Components/FormItemLabel.vue'
import GroupTipsContent from './Components/GroupTipsContent.vue'
import { Link } from '@element-plus/icons-vue'
import OpenByDrawer from './Components/OpenByDrawer.vue'
import OpenByDialog from './Components/OpenByDialog.vue'
import ChildrenGroupItem from './Components/ChildrenGroupItem.vue'
import { initFormRules } from '@/comRender/render/v1/Components/RenderForm/js/validate'
import { bindFormLinkage } from '@/comRender/render/v1/Core/linkage/watchLinkage'
import { btnEvent } from '@/comRender/render/v1/Core/buttonAction'
import { useTagsView } from '@/hooks/web/useTagsView'

defineOptions({ name: 'RenderFormIndex' })

const tag = useTagsView()
const props = defineProps({
  formProps: propTypes.object,
  formTableProps: propTypes.object,
  formLayouts: propTypes.object.def({}),
  flowNodeInfo: propTypes.object,
  isTableItem: propTypes.bool.def(false),
  tableFormGroup: propTypes.object.def({}),
  isDetail: propTypes.bool.def(false),
  isMapping: propTypes.bool.def(false),
  mainFormData: propTypes.object.def({})
})

const message = useMessage()
const instance = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const renderFormData = ref({})
const pageInfo: any = inject('pageInfo')
const isLoadPage = ref(false)
const apiInfo = ref()
const { pageType, id } = route.query
const emits = defineEmits(['layout-success', 'change-flow'])
renderFormData.value = {}
const renderFormProps = {
  labelPosition: (pageInfo && pageInfo.labelPosition) || 'right',
  ...props.formProps,
  //labelWidth:pageInfo.labelWidth==='auto' ? 'auto' : (pageInfo.labelWidth || 180)+'px',
  labelWidth: '180px'
}
console.log('renderFormProps', renderFormProps)
/**
 * 获取表单列span值
 * @param formItem
 */
const getColSpan = (formItem) => {
  //表格或抽屉弹框，固定按12展示
  if (props.isTableItem) {
    return Number(formItem.columnSpan) || 8
  }
  //如果是表单内部子表的表单，跨行显示
  if (formItem.isTableItem) {
    return 24
  }
  //字段设置>页面设置>默认值
  return Number(formItem.columnSpan) || Number(pageInfo.columnSpan) || 8
}

const activeNames = ref<any>([])

//组装表单项
const formGroups = ref()
const attachmentGroup = ref()

const tableFormMainData=ref({ ...props.mainFormData, ...renderFormData.value })
const initFormItem = async () => {
  apiInfo.value = pageInfo.pageApiRespVOS.find((item) => item.apiCode === 'form-create')
  console.log('apiInfo.value', apiInfo.value)
  if (props.isTableItem) {
    console.log('props.tableFormGroup:', props.tableFormGroup)
    renderFormData.value = initTableFormData(props.tableFormGroup)
    formGroups.value = [cloneDeep(props.tableFormGroup)]
    //设置默认值
    if (pageType === 'create' && !props.isMapping) {
      setDefValue(instance, formGroups.value, pageInfo, renderFormData.value, props.isTableItem)
    }
  } else {
    //初始化表单中表数据 并设置默认值
    renderFormData.value = initFormData(props.formLayouts)
    console.log('renderFormData', renderFormData)
    formGroups.value = setGroupFormItem(props.formLayouts, props.flowNodeInfo, renderFormData.value)
    console.log('formGroups', formGroups.value)
    //设置默认值
    if (pageType === 'create' && !props.isMapping) {
      setDefValue(instance, formGroups.value, pageInfo, renderFormData.value, false)
    }
    attachmentGroup.value = setAttachmentGroup(pageInfo)
  }
  tableFormMainData.value={ ...props.mainFormData, ...renderFormData.value }
  //初始化表单校验规则
  initFormRules(instance, formGroups.value, renderFormData.value, props.formLayouts)
  //激活折叠框
  activeNames.value = formGroups.value.map((groupItem) => groupItem.groupCode)
  activeNames.value.push('attach')
  if (!props.isTableItem) {
    //预加载组件数据
    await preLoadComponentData()
    //执行数据加载前阶段的自定义事件
    customEvent('created', instance, pageInfo, props.formLayouts, renderFormData.value, props.flowNodeInfo)
  }
  isLoadPage.value = true
  emits('layout-success')
}
initFormItem()
/**
 * 加载页面数据完成后执行的方法
 */
const loadDataOver = async () => {
  //绑定联动
  bindFormLinkage(
    instance,
    pageInfo,
    formGroups.value,
    attachmentGroup.value,
    renderFormData.value,
    null,
    'normal'
  )
  //加载初始化数据
  if (pageType === 'create' && props.isMapping) {
    //设置默认值，由上层页面控制何时执行
    //如果是普通表单，在表单加载完成后，执行
    //如果是流程表单，考虑到有数据映射，在数据映射完成后执行
    setDefValue(instance, formGroups.value, pageInfo, renderFormData.value, false)
  }
  //加载附件信息
  await initAttacementInfo(renderFormData.value, pageInfo, route.query.nodeId)
  if (pageType == 'create') {
    //执行初始化联动规则
    formLinkage(instance, 'INIT', formGroups.value, attachmentGroup.value, renderFormData.value)
  } else {
    //执行初始化联动规则
    formLinkage(instance, 'INIT', formGroups.value, attachmentGroup.value, renderFormData.value)
    //编辑 详情页面 加载数据完成后，走一次运行时联动
    formLinkage(instance, 'RUN', formGroups.value, attachmentGroup.value, renderFormData.value)
  }
  customEvent('data-load-after', instance, pageInfo, props.formLayouts, renderFormData.value, props.flowNodeInfo)
}
//定义watch数据，获取watch对象，后续用来清理停止watch
const watchList=ref()
const rowLoadOver = () => {
  tableFormMainData.value={ ...props.mainFormData, ...renderFormData.value }
  //绑定联动
  watchList.value=bindFormLinkage(
    instance,
    pageInfo,
    formGroups.value,
    attachmentGroup.value,
    tableFormMainData.value,
    props.tableFormGroup.tableId ,
    'mergeTable'
  )
  //执行初始化联动规则
  formLinkage(
    instance,
    'INIT',
    formGroups.value,
    attachmentGroup.value,
    { ...props.mainFormData, ...renderFormData.value },
    props.tableFormGroup.tableId
  )
  if (props.isDetail) {
    //编辑 详情页面 加载数据完成后，走一次运行时联动
    formLinkage(
      instance,
      'RUN',
      formGroups.value,
      attachmentGroup.value,
      { ...props.mainFormData, ...renderFormData.value },
      props.tableFormGroup.tableId
    )
  }
}
/**
 * 停止清理watch
 */
const stopWath=()=>{
  watchList.value.forEach(item=>{
    item()
  })
}

const checkGroupHidden = (groupItem) => {
  //分组设置了隐藏，直接隐藏
  if (groupItem.isHidden) {
    return false
  }
  //分组设置了插槽，则不隐藏
  if (groupItem.groupSlot) {
    return true
  }
  //判断分组下是否全部展示
  const isGroupShow = groupItem.formItems.some((item) => !item.isHidden)
  //判断子分组下是否展示
  const isChildGroupShow = groupItem.children?.some((childItem) => {
    return childItem.formItems.some((item) => !item.isHidden)
  })
  return isGroupShow || isChildGroupShow
}
/**
 * 组件默认事件统一触发
 * @param eventType
 * @param formItem
 * @param data
 */
const handleComponentEvent = (eventType, formItem, data) => {
  //console.log(eventType,formItem,data,renderFormData.value,apiInfo.value)
  handleEvent(
    eventType,
    formItem,
    instance,
    renderFormData.value,
    data,
    apiInfo.value.pageListConfigs,
    props.isTableItem
  )
  formItem.isLinkageFillValue = false
}

const formRef = ref()
const initForm = (data) => {
  renderFormData.value = Object.assign(renderFormData.value, cloneDeep(data))
}
/**
 * 表单控制流程
 * @param flowId
 * @param nodeId
 */
const changeFlow = (flowId, nodeId) => {
  emits('change-flow', flowId, nodeId)
}
/**
 * 更新表单
 */
const isReRunDataLoadAfterEvent = ref(false)
const updateFormItem = () => {
  if (isReRunDataLoadAfterEvent.value) {
    return
  }
  //添加特殊标记，防止脚本中循环调用
  isReRunDataLoadAfterEvent.value = true
  updateFormItemByFlow(formGroups.value, props.flowNodeInfo)
  //切换流程后，重新执行一次联动
  //执行初始化联动规则
  formLinkage(instance, 'INIT', formGroups.value, attachmentGroup.value, renderFormData.value)
  //编辑 详情页面 加载数据完成后，走一次运行时联动
  formLinkage(instance, 'RUN', formGroups.value, attachmentGroup.value, renderFormData.value)
  nextTick(() => {
    //添加过滤方法，防止死循环
    customEvent(
      'data-load-after',
      instance,
      pageInfo,
      props.formLayouts,
      renderFormData.value,
      props.flowNodeInfo,
      (item) => {
        return item.executableCode.indexOf('updateFormItem') < 0
      }
    )
  })
}
/**
 * 校验表单指定字段
 * @param fields
 */
const validateFields = async (fields) => {
  console.log('fields', fields)
  try {
    await formRef.value.validateField(fields)
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

const clearValidates = (fields) => {
  console.log('fields', fields)
  formRef.value.clearValidate(fields)
}
/**
 * 表单统一校验
 * @param status 是否是暂存校验
 */
const validateForm = async (status: boolean = false, isValidAttachment = true) => {
  if (status) {
    const formItemRulesList = []
    formGroups.value.forEach((groupItem) => {
      groupItem.formItems.forEach((formItem) => {
        if (formItem.rules && formItem.rules.length) {
          formItemRulesList.push(formItem)
        }
      })
    })
    const validateFields = []
    formItemRulesList.forEach((formItem) => {
      if (renderFormData.value[formItem.moduleTableId][formItem.field]) {
        validateFields.push(formItem.moduleTableId + '.' + formItem.field)
      }
    })
    console.log(validateFields, 'validateFields')
    if (validateFields && validateFields.length) {
      //暂存校验，只校验有值的field
      return formRef.value.validateField(validateFields)
    } else {
      return true
    }
  } else {
    //校验表单
    let formValid = false
    try {
      formValid = await formRef.value.validate()
    } catch (e) {
      scrollToDom('is-error')
      formValid = false
    }
    //校验子表  子表本身的新增、编辑弹框、抽屉不校验
    if (!props.isTableItem && props.formLayouts && props.formLayouts.tableLayoutConfig) {
      const requiredTable = props.formLayouts.tableLayoutConfig.filter((item) => item.isRequired == '1')
      if (requiredTable) {
        const emptyTableItem = requiredTable.find(
          (item) =>
            !(renderFormData.value['list_' + item.tableId] && renderFormData.value['list_' + item.tableId].length)
        )
        if (emptyTableItem) {
          //判断必填子表时，先判断子表是否显示，如果不显示，不校验；
          let tableIsHidden = false
          let tableTitle = ''
          const groupItem = formGroups.value.find((groupItem) => {
            if (groupItem.children && groupItem.children.length) {
              const childGroup = groupItem.children.find((childGroupItem) => {
                return childGroupItem.formItems.find((childGroupFormItem) => {
                  if (childGroupFormItem.isTableItem && childGroupFormItem.tableId == emptyTableItem.tableId) {
                    tableIsHidden = childGroupFormItem.isHidden
                    return true
                  } else {
                    return false
                  }
                })
              })
              if (childGroup) {
                tableTitle = childGroup.groupName
                return true
              }
            }
            return groupItem.formItems.find((groupFormItem) => {
              if (groupFormItem.isTableItem && groupFormItem.tableId == emptyTableItem.tableId) {
                tableIsHidden =
                  groupFormItem.isHidden || groupFormItem.tableItems.every((tableItem) => tableItem.isHidden)
                return true
              } else {
                return false
              }
            })
          })
          if (groupItem && !tableIsHidden) {
            message.warning(`请录入【${tableTitle || groupItem.groupName}】列表信息`)
            scrollToDom('render-form-group-' + groupItem.groupCode)
            return false
          }
        }
      }
    }
    //校验附件
    let attachmentValid = true
    if (isValidAttachment) {
      if (renderFormData.value.attachmentList && renderFormData.value.attachmentList.length) {
        attachmentValid = !renderFormData.value.attachmentList.some((item) => item.isRequire && !item.fileId)
        if (!attachmentValid) {
          message.warning('请上传必填附件')
          scrollToDom('render-form-attach-group')
          if (renderFormData.value.attachmentList.length > 6) {
            attachmentTableRef.value.scrollTop(
              renderFormData.value.attachmentList.findIndex((item) => item.isRequire && !item.fileId)
            )
          }
        }
      }
    }
    return formValid && attachmentValid
  }
}
const clearForm = () => {
  formRef.value.resetFields()
}
const getFormData = () => {
  return renderFormData.value
}
/**
 * 执行不同阶段的自定义事件
 * @param times
 */
const runCustomEvent = (times) => {
  return customEvent(times, instance, pageInfo, props.formLayouts, renderFormData.value, props.flowNodeInfo)
}

defineExpose({
  tag,
  pageType,
  initForm,
  validateForm,
  formGroups,
  clearForm,
  stopWath,
  getFormData,
  loadDataOver,
  rowLoadOver,
  changeFlow,
  route,
  message,
  pageInfo,
  updateFormItem,
  validateFields,
  clearValidates,
  runCustomEvent
})

watch(
  renderFormData,
  (val) => {
    //formLinkage('RUN', formGroups.value,attachmentGroup.value, val)
  },
  { deep: true }
)

const attachmentTableRef = ref()
// 加入对提示文本的处理方式
const openDrawer = ref()
const openDialog = ref()
const handleLink = (item: any) => {
  const linkOpenMethod = item.groupLinkType
  const linkUrl = item.groupLinkAddress
  if (linkOpenMethod === 'newPage') {
    window.open(linkUrl)
    return
  }
  if (linkOpenMethod === 'newTab') {
    // window.open(url.value)
    router.push({ path: '/openLink', query: { url: linkUrl } })
    return
  }
  if (linkOpenMethod === 'dialog') {
    // window.open(url.value)
    openDialog.value.openDialog(linkUrl)
    return
  }
  if (linkOpenMethod === 'drawer') {
    // window.open(url.value)
    openDrawer.value.openDrawer(linkUrl)
    return
  }
}

/**
 * 加载外部JS文件
 */
let externalJsModule: any = null
const loadExternalScript = async (jsSrc) => {
  try {
    externalJsModule = await import(new URL(`/src/web-sys/views/plugins/${jsSrc}`, import.meta.url).href)
  } catch (e) {
    console.error('外部JS文件地址错误')
  }
}
if (pageInfo.externalJsFile) {
  loadExternalScript(pageInfo.externalJsFile)
}
/**
 * 按钮事件
 * @param btnItem
 */
const handleBtnClick = (btnItem, data) => {
  //btnEvent(btnItem,instance,externalJsModule,row)
  //console.log(btnItem,data)
  btnEvent(btnItem, pageInfo.pageType, instance, externalJsModule, data, renderFormData.value)
}

//执行createed阶段的自定义事件
customEvent('created', instance, pageInfo, props.formLayouts, renderFormData.value, props.flowNodeInfo)

onMounted(async () => {
  //执行mounted阶段的自定义事件
  customEvent('mounted', instance, pageInfo, props.formLayouts, renderFormData.value, props.flowNodeInfo)
})

// 动态创建的计算属性
const computedProperties = reactive({})

// 动态创建计算属性的函数
const createComputedProperties = (id, str) => {
  // 计算折扣金额
  computedProperties[id] = computed(() => {
    return str
  })
}
</script>

<style scoped lang="scss">
.form-render-container {
  min-height: calc(100vh - 66px);
}
.formPage {
  border-bottom: none;

  :deep(.el-collapse-item) {
    background-color: #f5f6f7;
  }
  :deep(.el-form-item__label) {
    color: #999;
    font-size: 14px;
  }
  :deep(.el-form-item__content) {
    font-size: 14px;
  }
  :deep(.el-collapse-item__header) {
    position: relative;
    padding-left: 30px;
    border-bottom: 1px solid #f0f2f5;
    color: #333;
    font-weight: 700;
    line-height: 26px;
    font-size: 16px;
  }
  :deep(.el-collapse-item__header::before) {
    content: '';
    position: absolute;
    left: 17px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 14px;
    background-color: #cfa479;
  }
  :deep(.el-collapse-item__wrap) {
    padding: 24px 24px 8px;
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
  .tips-div {
    white-space: pre-line;
  }
  .normal-tip {
    padding: 5px;
  }
}
</style>
<style lang="scss">
.collapse-hidden {
  border-top: none !important;
  .el-collapse-item__header {
    display: none;
  }
  .el-collapse-item__wrap {
    padding: 0 !important;
  }
}
</style>
