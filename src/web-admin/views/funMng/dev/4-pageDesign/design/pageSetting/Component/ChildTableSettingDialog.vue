<template>
  <Dialog v-model="dialogVisible" :title="title" width="800">
    <div class="dialog-content">
      <el-form ref="formRef" :model="formData" label-width="120">
        <el-tabs v-model="activeTab" class="config-tabs">
          <el-tab-pane label="基础配置" name="basic">
            <el-row>
              <el-col :span="12">
                <el-form-item label="编辑模式" prop="sort">
                  <el-radio-group v-model="formData.editMode">
                    <el-radio value="table">表格模式</el-radio>
                    <el-radio value="form">表单模式</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否必填" prop="isRequired">
                  <el-switch
                    v-model="formData.isRequired"
                    inline-prompt
                    active-text="是"
                    active-value="1"
                    inactive-text="否"
                    inactive-value="0"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否不允许新增" prop="isNotAllowAdd">
                  <el-switch
                    v-model="formData.isNotAllowAdd"
                    inline-prompt
                    active-text="是"
                    active-value="1"
                    inactive-text="否"
                    inactive-value="0"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否隐藏操作列" prop="isHiddenAction">
                  <el-switch
                    v-model="formData.isHiddenAction"
                    inline-prompt
                    active-text="是"
                    active-value="1"
                    inactive-text="否"
                    inactive-value="0"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="子表标题" prop="tableTitle">
                  <el-input
                    v-model="formData.tableTitle"
                    placeholder="请输入标题"
                    class="w-200px"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="是否显示序号" prop="isShowIndex">
                  <el-switch
                    v-model="formData.isShowIndex"
                    inline-prompt
                    active-text="是"
                    active-value="1"
                    inactive-text="否"
                    inactive-value="0"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="自定义表字段名" prop="defTableFieldName">
                  <el-input
                    v-model="formData.defTableFieldName"
                    placeholder="请输入自定义表字段名"
                    class="w-200px"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="默认数据" prop="defaultData">
                  <BizSelectDict
                    v-model="formData.defaultData"
                    v-model:dict-name="formData.defaultDataName"
                    :show-label="formData.defaultDataName"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="显隐规则" name="showorhidden" lazy>
            <el-row>
              <el-col :span="24">
                <ConditionConfig v-model="formData.showConfig" :fieldList="fieldList"></ConditionConfig>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import BizSelectDict from "@/components-yt/biz/SelectDict/index.vue";
import ConditionConfig from "@/web-admin/views/funMng/dev/Components/ConditionConfig.vue";
import {propTypes} from "@/utils/propTypes";

defineOptions({ name: 'ChildTableSettingDialog' })

const props=defineProps({
  fieldList: propTypes.array.def([]),
})
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const activeTab = ref('basic')

const bizType = ref('create')
const title = ref('子表设置')
const formRef = ref()
const formData = ref({
  tableId:'',
  editMode: 'table',
  tableTitle:null,
  isRequired: '0',
  isNotAllowAdd:'0',
  isHiddenAction:'0',
  isShowIndex:'0',
  defTableFieldName:null,
  defaultData:null,
})
/** 打开弹窗 */
const open = async (tableId,data) => {
  dialogVisible.value = true
  if (data) {
    formData.value = data
  }else{
    formData.value = {
      tableId:tableId,
      editMode: 'table',
      isRequired: '0',
      isNotAllowAdd:'0',
      isHiddenAction:'0',
      isShowIndex:'0',
      defTableFieldName:null,
      defaultData:null,
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

onMounted(() => {})

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  dialogVisible.value = false
  emit('success', cloneDeep(formData.value))
}
</script>
<style lang="scss" scoped>
.dialog-content{
  height: 500px;
}
.show-config-item{
  :deep(.el-form-item__label){
    height: 52px;
    line-height: 52px;
  }
}
</style>
