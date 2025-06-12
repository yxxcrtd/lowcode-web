<template>
  <div class="oprate-button-warp-noselect"> 
    <el-button type="primary" @click="addRow()" class="mb-10px"> 新增按钮 </el-button>
    <el-button @click="setDefaultBtn" class="mb-10px"> 加载默认按钮 </el-button>
   </div>
  <!-- <div class="datamodel-header">
  </div> -->
  <vxe-table border="inner" stripe align="center" height="500px" :data="formData.pageButtons">
    <vxe-column type="seq" title="序号" width="60" align="center" />
    <vxe-column field="operationType" title="操作类型" width="130">
      <template #default="{ row }">
        <el-select v-model="row.operationType">
          <el-option
            v-for="(item, index) in operationTypeOptions"
            :key="'operationType_' + index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>
    </vxe-column>
    <vxe-column field="buttonName" title="按钮名称" min-width="180">
      <template #default="{ row }">
        <el-input v-model="row.buttonName" />
      </template>
    </vxe-column>
    <vxe-column field="buttonStyle" title="按钮样式" min-width="180">
      <template #default="{ row }">
        <el-select v-model="row.buttonStyle">
          <el-option
            v-for="(item, index) in buttonStyleOption"
            :key="'buttonStyle_' + index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>
    </vxe-column>
    <vxe-column field="permissionSign" title="权限标识" width="240">
      <template #default="{ row }">
        <el-input v-model="row.permissionSign" placeholder="请输入权限标识">
          <template #prepend>页面ID:</template>
        </el-input>
      </template>
    </vxe-column>
    <vxe-column field="buttonIcon" title="按钮图标" min-width="180">
      <template #default="{ row }">
        <IconSelect v-model="row.buttonIcon" clearable />
      </template>
    </vxe-column>
    <vxe-column field="showCondition" title="显示条件" width="100" align="center">
      <template #default="{ row }">
        <div class="table-row-cfg-wrap">
          <el-button
            text
            type="primary"
            @click="openDialog('showCondition', row)"
            :class="row.conditionalTableRespVO ? 'green-text' : ''"
          >
            配置
          </el-button>
          <el-popconfirm
            title="确定清空配置?"
            @confirm="clearCfg(row, 'conditionalTableRespVO')"
            v-if="row.conditionalTableRespVO"
          >
            <template #reference>
              <el-icon class="cfg-del-btn" title="清空配置">
                <Delete />
              </el-icon>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </vxe-column>
    <vxe-column field="actionType" title="按钮动作" width="110" align="center">
      <template #default="{ row }">
        <div class="table-row-cfg-wrap">
          <el-button
            text
            type="primary"
            @click="openDialog('showButtonActionCfg', row)"
            :class="row.showButtonActionCfg ? 'green-text' : ''"
          >
            配置
          </el-button>
          <el-popconfirm
            title="确定清空配置?"
            @confirm="clearCfg(row, 'showButtonActionCfg')"
            v-if="row.showButtonActionCfg"
          >
            <template #reference>
              <el-icon class="cfg-del-btn" title="清空配置">
                <Delete />
              </el-icon>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </vxe-column>
    <vxe-column field="actionDefaultParams" title="按钮默认参数" width="110" align="center">
      <template #default="{ row }">
        <div class="table-row-cfg-wrap">
          <el-button
            text
            type="primary"
            @click="openDialog('actionDefaultParams', row)"
            :class="row.actionDefaultParams ? 'green-text' : ''"
          >
            配置
          </el-button>
          <el-popconfirm
            title="确定清空配置?"
            @confirm="clearCfg(row, 'actionDefaultParams')"
            v-if="row.actionDefaultParams"
          >
            <template #reference>
              <el-icon class="cfg-del-btn" title="清空配置">
                <Delete />
              </el-icon>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </vxe-column>
    <vxe-column field="remark" title="备注" min-width="180">
      <template #default="{ row }">
        <el-input v-model="row.remark" />
      </template>
    </vxe-column>
    <vxe-column field="action" title="操作" min-width="80">
      <template #default="{ row, rowIndex }">
        <div class="table-action">
          <el-link type="primary" @click="handleDelete(row, rowIndex)">删除</el-link>
        </div>
      </template>
    </vxe-column>
  </vxe-table>
  <ConditionDialog
    v-if="formData && formData.templateApiList && formData.templateApiList.length"
    ref="conditionDialogRef"
    :field-list="formData.templateApiList[0].tableColumns"
    @success="configSuccess('showCondition', $event)"
  />
  <ButtonActionCfgDialog ref="buttonActionCfgDialogRef" @success="configSuccess('showButtonActionCfg', $event)" />
  <EditorDialog mode="json" title="按钮默认参数" ref="editorDialogRef" @success="editorSuccess"></EditorDialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { propTypes } from '@/utils/propTypes'
import ConditionDialog from '@/web-admin/views/funMng/dev/Components/ConditionDialog.vue'
import ButtonActionCfgDialog from '@/web-admin/views/funMng/dev/Components/ButtonActionCfgDialog.vue'
import { PageModelVO } from '../../../../type'
import * as UserGroupApi from '@/api/bpm/userGroup'
import { Delete } from '@element-plus/icons-vue'
import EditorDialog from '../../../../../Components/EditorDialog.vue'
defineOptions({ name: 'ListPageDesignIndex' })

const formData: any = defineModel()
const emit = defineEmits(['close-click', 'chooseModel'])

const message = useMessage() // 消息弹窗

const operationTypeOptions = ref([
  {
    label: '暂存',
    value: 'staging'
  },
  {
    label: '保存',
    value: 'save'
  },
  {
    label: '提交',
    value: 'submit'
  },
  {
    label: '取消',
    value: 'cancel'
  },
  {
    label: '自定义',
    value: 'custom'
  }
])
const buttonStyleOption = ref([
  {
    label: '默认',
    value: 'default'
  },
  {
    label: '主要按钮',
    value: 'primary'
  },
  {
    label: '链接按钮',
    value: 'link'
  },
  {
    label: '朴素按钮',
    value: 'plain'
  },
  {
    label: '圆角按钮',
    value: 'round'
  },
  {
    label: '圆形按钮',
    value: 'circle'
  }
])

const openWayOption = ref([
  {
    label: '默认',
    value: 'default'
  },
  {
    label: '弹框',
    value: 'dialog'
  },
  {
    label: '全屏弹框',
    value: 'dialog-fullscreen'
  },
  {
    label: '抽屉',
    value: 'drawer'
  },
  {
    label: '新页签',
    value: 'new-tab'
  },
  {
    label: '当前页签',
    value: 'cur-tab'
  }
])

const defaultButtonData = [
  {
    operationType: 'staging',
    buttonName: '暂存',
    buttonStyle: 'default',
    permissionSign: 'staging',
    buttonIcon: '',
    customMethod: ''
  },
  {
    operationType: 'save',
    buttonName: '保存',
    buttonStyle: 'primary',
    permissionSign: 'save',
    buttonIcon: '',
    customMethod: ''
  },
  {
    operationType: 'submit',
    buttonName: '提交',
    buttonStyle: 'primary',
    permissionSign: 'submit',
    buttonIcon: '',
    customMethod: ''
  },
  {
    operationType: 'cancel',
    buttonName: '取消',
    buttonStyle: 'default',
    buttonIcon: '',
    customMethod: ''
  }
]

const addRow = () => {
  formData.value.pageButtons.push({})
}
const handleDelete = async (row, rowIndex) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    formData.value.pageButtons.splice(rowIndex, 1)
  } catch {}
}

const curRow = ref()
const conditionDialogRef = ref()
const buttonActionCfgDialogRef = ref()
const editorDialogRef = ref()
const openDialog = (type, row) => {
  curRow.value = row
  if (type === 'showCondition') {
    conditionDialogRef.value.open(cloneDeep(row.conditionalTableRespVO))
  }
  if (type === 'showButtonActionCfg') {
    buttonActionCfgDialogRef.value.open(cloneDeep(row.showButtonActionCfg))
  }
  if (type === 'actionDefaultParams') {
    editorDialogRef.value.open(cloneDeep(row.actionDefaultParams))
  }
}
const configSuccess = (type, data) => {
  if (type === 'showCondition') {
    curRow.value.conditionalTableRespVO = data
  }
  if (type === 'showButtonActionCfg') {
    curRow.value.showButtonActionCfg = data
  }
}
const editorSuccess = (data) => {
  curRow.value.actionDefaultParams = data
}

const clearCfg = (row, field) => {
  row[field] = null
}

/** 加载默认按钮 */
const setDefaultBtn = async (type: string, id?: number) => {
  formData.value.pageButtons = cloneDeep(defaultButtonData)
}
onMounted(()=>{
  if(!formData.value.pageButtons){
    formData.value.pageButtons=[]
  }
})
defineExpose({ setDefaultBtn }) // 提供 open 方法，用于打开弹窗
</script>
<style lang="scss" scoped></style>
