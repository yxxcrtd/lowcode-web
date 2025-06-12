<template>
  <Dialog title="表格设置" v-model="dialogVisible" width="800">
    <div class="dialog-content">
      <el-form ref="formDataRef" label-width="auto" class="demo-formData" status-icon>
        <el-row>
          <el-col :span="12">
            <el-form-item label="显示行号" prop="region">
              <el-switch
                v-model="formData.tableSort"
                inline-prompt
                active-text="是"
                :active-value="1"
                inactive-text="否"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="每页行号默认起始" prop="name">
              <el-radio-group v-model="formData.tableBeginIndex">
                <el-radio value="form-one">从1开始</el-radio>
                <el-radio value="form-page">根据记录开始</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="斑马纹" prop="name">
              <el-switch
                v-model="formData.tableStripes"
                inline-prompt
                active-text="是"
                :active-value="1"
                inactive-text="否"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否显示复选框" prop="name">
              <el-switch
                v-model="formData.isShowCheckBox"
                inline-prompt
                active-text="是"
                :active-value="1"
                inactive-text="否"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="固定操作列" prop="name">
              <el-switch
                v-model="formData.tableFixedAction"
                inline-prompt
                active-text="是"
                :active-value="1"
                inactive-text="否"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作列位置" prop="name">
              <el-radio-group v-model="formData.tableActionPostion">
                <el-radio value="left">居左</el-radio>
                <el-radio value="right">居右</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否支持分页" prop="name">
              <el-switch
                v-model="formData.isPageList"
                inline-prompt
                active-text="是"
                :active-value="1"
                inactive-text="否"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.isPageList==1">
            <el-form-item label="默认分页大小" prop="name">
              <el-select v-model="formData.tableDefPageSize" placeholder="请选择">
                <el-option label="10" :value="10" />
                <el-option label="20" :value="20" />
                <el-option label="50" :value="50" />
                <el-option label="100" :value="100" />
                <el-option label="200" :value="200" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'

defineOptions({ name: 'TableSettingDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formData = ref({
  tableId:'',
  tableSort: 1,
  isShowCheckBox:1,
  tableStripes: 1,
  tableBeginIndex: 'form-page',
  tableFixedAction: 1,
  tableActionPostion: 'right',
  isPageList:1,
  tableDefPageSize: 10,
})
/** 打开弹窗 */
const open = (tableId, data) => {
  dialogVisible.value = true
  if (data) {
    formData.value = data
  }else{
    formData.value = {
      tableId:tableId,
      tableSort: 1,
      tableStripes: 1,
      tableBeginIndex: 'form-page',
      tableFixedAction: 1,
      tableActionPostion: 'right',
      isPageList:1,
      tableDefPageSize: 10,
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  dialogVisible.value = false
  emit('success', cloneDeep(formData.value))
}

</script>
<style lang="scss" scoped>
.dialog-content {
  height: 308px;
}
</style>
