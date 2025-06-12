<template>
  <el-dialog title="列表页配置" v-model="dialogVisible" fullscreen>
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
              <el-col :span="8">
              </el-col>
              <el-col :span="8">
                <el-form-item label="数据模型" prop="modelName">
                  <el-select v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
              </el-col>
              <el-col :span="8">
              </el-col>
              <el-col :span="8">
                <el-form-item label="页面风格" prop="modelName">
                  <el-select v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
              </el-col>
              <el-col :span="8">
              </el-col>
              <el-col :span="8">
                <el-form-item label="页头插槽" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="中间插槽" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="尾部插槽" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="列表配置" name="tableConfig">
          <div class="datamodel-header">
            <el-button type="primary" @click="addRow()" class="mb-10px"> 表格设置 </el-button>
          </div>
          <div class="datamodel-content">
            <div class="content-left">
              <div class="view-tabs">
                <el-segmented v-model="curView" :options="viewOptions" block />
              </div>
              <div class="model-cards">
                <div class="model-cards-item" v-for="(item,index) in modelFieldList" :key="'model_list_'+index">
                  <div class="main">
                    <div class="title">
                      <el-tag type="danger" v-if="item.isMain">主</el-tag>
                      <el-tag type="danger" v-if="item.isLeft">左联</el-tag>
                      <el-tag type="danger" v-if="item.isRight">右联</el-tag>
                      <el-tag type="danger" v-if="item.isChild">子表</el-tag>
                      {{item.modelName}}
                    </div>
                    <div class="subTitle">
                      <el-tag type="primary" v-if="item.isTable">表</el-tag>
                      <el-tag type="primary" v-if="item.isModel">模型</el-tag>
                      {{item.modelCode}}</div>
                  </div>
                  <div class="action">

                  </div>
                </div>
              </div>
            </div>
            <div class="content-right">
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
                    <vxe-column field="field" title="列字段" min-width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.field" />
                      </template>
                    </vxe-column>
                    <vxe-column field="name" title="列名称" min-width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.name" />
                      </template>
                    </vxe-column>
                    <vxe-column field="name" title="字段别名" min-width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.name" />
                      </template>
                    </vxe-column>
                    <vxe-column field="name" title="所属分组" min-width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.name" />
                      </template>
                    </vxe-column>
                    <vxe-column field="align" title="对齐方式" width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.align" />
                      </template>
                    </vxe-column>
                    <vxe-column field="width" title="固定宽度" width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.width" type="number" />
                      </template>
                    </vxe-column>
                    <vxe-column field="minWidth" title="最小宽度" width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.minWidth" type="number" />
                      </template>
                    </vxe-column>
                    <vxe-column field="isShow" title="是否显示" width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.isShow" type="number" />
                      </template>
                    </vxe-column>
                    <vxe-column field="fixed" title="是否固定列" width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.fixed" type="number" />
                      </template>
                    </vxe-column>
                    <vxe-column field="contentSlot" title="插槽" width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.contentSlot" type="number" />
                      </template>
                    </vxe-column>
                    <vxe-column field="conventType" title="数据转换规则" width="180">
                      <template #default="{ row }">
                        <el-button type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>
                      </template>
                    </vxe-column>
                    <vxe-column field="showType" title="展示规则" width="180">
                      <template #default="{ row }">
                        <el-button type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>
                      </template>
                    </vxe-column>
                    <vxe-column field="isImport" title="导入规则" width="180">
                      <template #default="{ row }">
                        <el-button type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>
                      </template>
                    </vxe-column>
                    <vxe-column field="isExport" title="导出规则" width="180">
                      <template #default="{ row }">
                        <el-button type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>
                      </template>
                    </vxe-column>
                    <vxe-column field="isTotal" title="是否合计列" width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.isTotal" type="number" />
                      </template>
                    </vxe-column>
                    <vxe-column field="isSort" title="是否支持排序" width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.isSort" type="number" />
                      </template>
                    </vxe-column>
                    <vxe-column field="headerTips" title="表头tips" width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.headerTips" type="number" />
                      </template>
                    </vxe-column>
                    <vxe-column field="headerSlot" title="表头插槽" width="180" :edit-render="{}">
                      <template #edit="{ row }">
                        <el-input v-model="row.headerSlot" type="number" />
                      </template>
                    </vxe-column>
                  </vxe-table>
                </div>
              </el-form>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="查询条件" name="search">
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
              <vxe-column field="field" title="列字段" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.field" />
                </template>
              </vxe-column>
              <vxe-column field="name" title="列名称" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.name" />
                </template>
              </vxe-column>
              <vxe-column field="name" title="查询别名" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.name" />
                </template>
              </vxe-column>
              <vxe-column field="align" title="是否查询列" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.align" />
                </template>
              </vxe-column>
              <vxe-column field="width" title="查询操作符" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.width" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="name" title="显示组件" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.name" />
                </template>
              </vxe-column>
              <vxe-column field="isShow" title="联动配置" width="180">
                <template #default="{ row }">
                  <el-button type="primary" @click="openDialog('linkage',row)" size="small" class="mb-10px"> 配置 </el-button>
                </template>
              </vxe-column>
              <vxe-column field="fixed" title="默认值" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.fixed" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="isTotal" title="是否必填" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.isTotal" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="contentSlot" title="插槽" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.contentSlot" type="number" />
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="操作按钮" name="actionBtn">
          <div style="display: flex; justify-content: center; width: 100%">
            <el-radio-group v-model="btnType" size="large">
              <el-radio-button label="左边按钮" value="1" />
              <el-radio-button label="右边按钮" value="2" />
              <el-radio-button label="行内按钮" value="3" />
            </el-radio-group>
          </div>
          <div v-show="btnType == 1">
            <div class="datamodel-header">
              <el-button type="primary" @click="addRow()" class="mb-10px"> 新增按钮 </el-button>
            </div>
            <vxe-table
              border
              stripe
              align="left"
              height="500px"
              :edit-config="{ mode: 'row', trigger: 'click', showIcon: false }"
              :mouse-config="{ selected: true }"
              @current-change="currentChange"
              :data="tableData"
            >
              <vxe-column type="seq" title="序号" width="60" align="center" />
              <vxe-column field="field" title="操作类型" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.field" />
                </template>
              </vxe-column>
              <vxe-column field="name" title="按钮名称" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.name" />
                </template>
              </vxe-column>
              <vxe-column field="align" title="按钮样式" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.align" />
                </template>
              </vxe-column>
              <vxe-column field="width" title="按钮图标" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.width" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="minWidth" title="打开方式" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.minWidth" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="isShow" title="关联页面" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.isShow" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="fixed" title="显示条件" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-button type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>
                </template>
              </vxe-column>
              <vxe-column field="conventType" title="前后处理" width="180">
                <template #default="{ row }">
                  <el-button type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>
                </template>
              </vxe-column>
            </vxe-table>
          </div>

          <div v-show="btnType == 2">
            <div class="datamodel-header">
              <el-button type="primary" @click="addRow()" class="mb-10px"> 新增按钮 </el-button>
            </div>
            <vxe-table
              border
              stripe
              align="left"
              height="500px"
              :edit-config="{ mode: 'row', trigger: 'click', showIcon: false }"
              :mouse-config="{ selected: true }"
              @current-change="currentChange"
              :data="tableData"
            >
              <vxe-column type="seq" title="序号" width="60" align="center" />
              <vxe-column field="field" title="操作类型" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.field" />
                </template>
              </vxe-column>
              <vxe-column field="name" title="按钮名称" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.name" />
                </template>
              </vxe-column>
              <vxe-column field="align" title="按钮样式" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.align" />
                </template>
              </vxe-column>
              <vxe-column field="width" title="按钮图标" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.width" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="minWidth" title="打开方式" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.minWidth" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="isShow" title="关联页面" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.isShow" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="fixed" title="显示条件" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-button type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>
                </template>
              </vxe-column>
              <vxe-column field="conventType" title="前后处理" width="180">
                <template #default="{ row }">
                  <el-button type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>
                </template>
              </vxe-column>
            </vxe-table>
          </div>

          <div v-show="btnType == 3">
            <div class="datamodel-header">
              <el-button type="primary" @click="addRow()" class="mb-10px"> 新增按钮 </el-button>
            </div>
            <vxe-table
              border
              stripe
              align="left"
              height="500px"
              :edit-config="{ mode: 'row', trigger: 'click', showIcon: false }"
              :mouse-config="{ selected: true }"
              @current-change="currentChange"
              :data="tableData"
            >
              <vxe-column type="seq" title="序号" width="60" align="center" />
              <vxe-column field="field" title="操作类型" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.field" />
                </template>
              </vxe-column>
              <vxe-column field="name" title="按钮名称" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.name" />
                </template>
              </vxe-column>
              <vxe-column field="align" title="按钮样式" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.align" />
                </template>
              </vxe-column>
              <vxe-column field="width" title="按钮图标" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.width" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="minWidth" title="打开方式" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.minWidth" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="isShow" title="关联页面" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.isShow" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="fixed" title="显示条件" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-button type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>
                </template>
              </vxe-column>
              <vxe-column field="conventType" title="前后处理" width="180">
                <template #default="{ row }">
                  <el-button type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>
                </template>
              </vxe-column>
            </vxe-table>
          </div>
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
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { CirclePlusFilled, RemoveFilled } from '@element-plus/icons-vue'
import ComponentPropDialog from "../../Components/ComponentPropDialog.vue";
import LinkageDialog from "../../Components/LinkageDialog.vue";
import ValidateDialog from "../../Components/ValidateDialog.vue";

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

const curView = ref('模型视图')
const viewOptions=ref(['模型视图','分组视图'])

const btnType = ref('1')
const rules = reactive({
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  modelCode: [{ required: true, message: '请输入模型编码', trigger: 'blur' }],
  modelDataSource: [{ required: true, message: '请选择数据源', trigger: 'blur' }],
  modelType: [{ required: true, message: '请选择模型类型', trigger: 'blur' }]
})


const curModel = ref(null)
const modelFieldList = ref([
  {
    modelName: '主表',
    modelCode:'biz-main',
    isMain: true,
    isTable:true,
    fieldList:[]
  },
  {
    modelName: '表1',
    modelCode:'biz-main',
    isLeft: true,
    isTable:true
  },
  {
    modelName: '表2',
    modelCode:'biz-main',
    isRight: true,
    isTable:true
  },
  {
    modelName: '表3',
    modelCode:'biz-main',
    isRight: false,
    isChild:true,
    isTable:true
  }
])
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
const componentPropDialog=ref()
const openDialog=(type,row)=>{
  if(type==='validate'){
    validateDialogRef.value.open(type, row.id)
  }
  if(type==='linkage'){
    linkageDialogRef.value.open(type, row.id)
  }
  if(type==='componentProp'){
    componentPropDialog.value.open(type, row.id)
  }
}
</script>
<style scoped lang="scss">

.datamodel-content {
  display: flex;
}
.main-icon {
  background: #1e83e9;
  color: #fff;
  font-size: 12px;
  padding: 2px;
  border-radius: 4px;
  margin-right: 6px;
}
.custom-tree-node{
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-right:10px;
  a{
    font-size: 12px;
    color: #1e83e9;
    cursor: pointer;
  }
}
.left-tree{
  border-right: 1px solid #e9e4e4;
  margin: 0 10px;
}

.content-left{
  width: 260px;
  min-width: 260px;
  padding:5px 10px 5px 0;
  margin:0 16px 0 0;
  border-right: 1px solid #e9e4e4;
  .view-tabs{
    display: flex;
    justify-content: center;
    margin: 0px 0px 10px;
  }
  .model-cards{
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .model-cards-item{
      background: #f6f6f6;
      border-radius: 4px;
      padding: 5px 10px;
      display: flex;
      margin-bottom: 10px;
      .main{
        .title{
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .subTitle{
          font-size: 12px;
          color: #929292;
        }
      }
    }
    .model-cards-item:hover{
      border:1px solid #2340a0;
      background: #ebf0fc;
      .main{
        .title{
          color: #294aa6;
        }
        .subTitle{
          color: #a2abd7;
        }
      }
    }
  }
}
.content-right{
  width: calc(100% - 300px);
}
</style>
