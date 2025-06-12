<template>
  <el-dialog title="表单页配置" v-model="dialogVisible" fullscreen>
    <div class="page-container">
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="base">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="100">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="页面名称" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="页面编码" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="数据模型" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="默认查询" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="页面风格" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8"/>
              <el-col :span="8">
                <el-form-item label="页面模板" prop="modelName">
                  <el-select v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8"/>
              <el-col :span="8"/>
              <el-col :span="8">
                <el-form-item label="父页面套壳" prop="modelName">
                  <el-select v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="内部插槽" prop="modelName">
                  <el-button>插槽</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="表单项配置" name="tableConfig">
          <el-form>
            <div style="height: calc(100vh - 240px)">
              <vxe-table
                border
                stripe
                align="left"
                height="100%"
                :edit-config="{ mode: 'row', trigger: 'click', showIcon: false }"
                :mouse-config="{ selected: true }"
                @current-change="currentChange"
                :data="tableData"
              >
                <vxe-column type="seq" title="序号" width="60" align="center" />
                <vxe-column field="field" title="字段" min-width="180" :edit-render="{}">
                  <template #edit="{ row }">
                    <el-input v-model="row.field" />
                  </template>
                </vxe-column>
                <vxe-column field="name" title="标题" min-width="180" :edit-render="{}">
                  <template #edit="{ row }">
                    <el-input v-model="row.name" />
                  </template>
                </vxe-column>
                <vxe-column field="align" title="所属模型" width="180" :edit-render="{}">
                  <template #edit="{ row }">
                    <el-input v-model="row.align" />
                  </template>
                </vxe-column>
                <vxe-column field="width" title="显示组件" width="180" :edit-render="{}">
                  <template #edit="{ row }">
                    <el-input v-model="row.width" type="number" />
                  </template>
                </vxe-column>
                <vxe-column field="conventType" title="组件配置" width="180">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="openDialog('componentProp',row)" class="mb-10px"> 配置 </el-button>
                  </template>
                </vxe-column>
                <vxe-column field="minWidth" title="是否必填" width="180" :edit-render="{}">
                  <template #edit="{ row }">
                    <el-input v-model="row.minWidth" type="number" />
                  </template>
                </vxe-column>
                <vxe-column field="isShow" title="校验规则" width="180">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="openDialog('validate',row)" > 配置 </el-button>
                  </template>
                </vxe-column>
                <vxe-column field="conventType" title="联动配置" width="180">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="openDialog('linkage',row)"> 配置 </el-button>
                  </template>
                </vxe-column>
                <vxe-column field="conventType" title="事件配置" width="180">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="openDialog('event',row)"> 配置 </el-button>
                  </template>
                </vxe-column>
                <vxe-column field="fixed" title="占位符" width="180" :edit-render="{}">
                  <template #edit="{ row }">
                    <el-input v-model="row.fixed" type="number" />
                  </template>
                </vxe-column>
                <vxe-column field="fixed" title="Tips" width="180" :edit-render="{}">
                  <template #edit="{ row }">
                    <el-input v-model="row.fixed" type="number" />
                  </template>
                </vxe-column>
                <vxe-column field="fixed" title="宽度" width="180" :edit-render="{}">
                  <template #edit="{ row }">
                    <el-input v-model="row.fixed" type="number" />
                  </template>
                </vxe-column>
                <vxe-column field="contentSlot" title="插槽" width="180" :edit-render="{}">
                  <template #edit="{ row }">
                    <el-input v-model="row.contentSlot" type="number" />
                  </template>
                </vxe-column>
              </vxe-table>
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="校验配置" name="validate"> 
          4
        </el-tab-pane>
        <el-tab-pane label="拓展事件" name="event"> 3 </el-tab-pane>
        <el-tab-pane label="入参说明" name="params"> 3 </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <ValidateDialog ref="validateDialogRef" />
  <LinkageDialog ref="linkageDialogRef"/>
  <ComponentPropDialog ref="componentPropDialogRef"/>
  <EventDialog ref="eventDialogRef"/>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { CirclePlusFilled, RemoveFilled } from '@element-plus/icons-vue'
import ValidateDialog from '../../Components/ValidateDialog.vue'
import LinkageDialog from '../../Components/LinkageDialog.vue'
import ComponentPropDialog from '../../Components/ComponentPropDialog.vue'
import EventDialog from '../../Components/EventDialog.vue'

defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const activeName = ref('base')
const formRef = ref()
const form = ref({
  modelName: '',
  modelCode: '',
  modelDataSource: '',
  modelType: '',
  modelRemark: null
})
const btnType = ref('1')
const rules = reactive({
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  modelCode: [{ required: true, message: '请输入模型编码', trigger: 'blur' }],
  modelDataSource: [{ required: true, message: '请选择数据源', trigger: 'blur' }],
  modelType: [{ required: true, message: '请选择模型类型', trigger: 'blur' }]
})
const tableData = [
  {
    field: 'code',
    name: '编号',
    align: '居中',
    width: 200,
    minWidth: 200,
    isShow: true,
    fix: '左边固定',
    conventType: '不转换',
    showType: '不设置',
    isImport: true,
    isExport: true,
    isTotal: true,
    isSort: true,
    headerTips: '',
    headerSlot: '',
    contentSlot: ''
  },
  {
    field: 'code',
    name: '编号',
    align: '居中',
    width: 200,
    minWidth: 200,
    isShow: true,
    fix: '左边固定',
    conventType: '不转换',
    showType: '不设置',
    isImport: true,
    isExport: true,
    isTotal: true,
    isSort: true,
    headerTips: '',
    headerSlot: '',
    contentSlot: ''
  },
  {
    field: 'code',
    name: '编号',
    align: '居中',
    width: 200,
    minWidth: 200,
    isShow: true,
    fix: '左边固定',
    conventType: '不转换',
    showType: '不设置',
    isImport: true,
    isExport: true,
    isTotal: true,
    isSort: true,
    headerTips: '',
    headerSlot: '',
    contentSlot: ''
  }
]
const tableActiveName = ref('fields')
/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      message.success('提交成功！')
      dialogVisible.value = false
      emit('success', '123')
    } else {
      message.error('表单验证失败，请检查输入')
      return false
    }
  })
}
const validateDialogRef=ref()
const linkageDialogRef=ref()
const eventDialogRef=ref()
const componentPropDialogRef=ref()
const openDialog=(type,row)=>{
  if(type==='validate'){
    validateDialogRef.value.open(type, row.id)
  }
  if(type==='linkage'){
    linkageDialogRef.value.open(type, row.id)
  }
  if(type==='event'){
    eventDialogRef.value.open(type, row.id)
  }
  if(type==='componentProp'){
    componentPropDialogRef.value.open(type, row.id)
  }
}
</script>
