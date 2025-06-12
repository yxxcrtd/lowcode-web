<template>
  <Dialog title="表格设置" v-model="dialogVisible" width="800">
    <div class="dialog-content">
      <el-form ref="formDataRef" label-width="auto" class="demo-formData" status-icon>
        <div class="content">
          <div class="flex-50 form-item">
            <el-form-item label="显示行号" prop="region">
              <el-switch
                v-model="formData.tableLine"
                inline-prompt
                active-text="是"
                :active-value="1"
                inactive-text="否"
                :inactive-value="0"
              />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="每页行号默认起始" prop="name">
              <el-radio-group v-model="formData.tableBeginIndex">
                <el-radio value="Y">从1开始</el-radio>
                <el-radio value="N">根据记录开始</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
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
          </div>
          <div class="flex-50 form-item">
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
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="操作列位置" prop="name">
              <el-select v-model="formData.tableActionPostion">
                <el-option label="左" value="left" />
                <el-option label="右" value="right" />
              </el-select>
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="默认分页大小" prop="name">
              <el-select v-model="formData.tableDefPageSize" placeholder="请选择">
                <el-option label="10" value="default" />
                <el-option label="20" value="large" />
                <el-option label="50" value="small" />
                <el-option label="100" value="small" />
                <el-option label="200" value="small" />
              </el-select>
            </el-form-item>
          </div>
        </div>
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

defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formData = ref({
  prefix: '',
  suffix: '',
  numType: '',
  keepDecimalPlaces: '',
  conversionRate: '',
  thousandth: false,
  dateFormat: '',
  pictureStyle: '',
  linkOpenMethod: '',
  linkAddress: '',
  regularExpression: '',
  componentName: '',
  formatType: '',
  script: ''
})
/** 打开弹窗 */
const open = async (type: string, data) => {
  dialogVisible.value = true
  if (data) {
    formData.value = data
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  message.success('提交成功！')
  dialogVisible.value = false
  emit('success', cloneDeep(formData.value))
}

</script>
<style lang="scss" scoped>
.dialog-content {
  height: 308px;
}
</style>
