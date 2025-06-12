<template>
  <Dialog title="标签管理" v-model="dialogVisible" width="800">
    <div class="validate-dialog-content">
      <el-form ref="formRef" :model="formData" label-width="auto">
        <el-button type="primary" :icon="Plus" class="mb-10px" size="small" @click="add"> 添加 </el-button>
        <div class="table-content" element-loading-text="加载中">
          <vxe-table border="inner" align="center" v-loading="loading" style="width: 100%;max-height: 60vh;" :data="formData.formItemTagList">
            <vxe-column field="field" title="标签" minWidth="150">
              <template #default="{ row, rowIndex }">
                <el-form-item :prop="'formItemTagList[' + rowIndex + '].value'" :rules="rules.value">
                  <el-input v-model="row.value" />
                </el-form-item>
              </template>
            </vxe-column>
            <vxe-column type="seq" title="编码" minWidth="150" align="center">
              <template #default="{ row, rowIndex }">
                <el-form-item :prop="'formItemTagList[' + rowIndex + '].key'" :rules="rules.key">
                  <el-input v-model="row.key" />
                </el-form-item>
              </template>
            </vxe-column>
            <vxe-column field="field" title="备注" minWidth="150">
              <template #default="{ row }">
                <el-form-item>
                  <el-input v-model="row.remark" />
                </el-form-item>
              </template>
            </vxe-column>
            <vxe-column field="action" title="操作" width="80">
              <template #default="{ rowIndex }">
                <div class="table-action">
                  <el-link type="primary" @click="deleteTag(rowIndex)">删除</el-link>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
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
import { getByCategory, saveConfig } from '../api'
import { Plus } from '@element-plus/icons-vue'
defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formRef = ref()
const formData:any = ref({
  formItemTagList:[]
})
const rules = ref({
  key:[{ required: true, message: '请输入', trigger: ['blur','change'] }],
  value:[{ required: true, message: '请输入', trigger: ['blur','change'] }]
})

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
  getData()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const loading = ref(false)

/** 获取数据 */
const getData = async () => {
  try{
    loading.value = true
    const res = await getByCategory({ category: 'formItemTag' })
    formData.value.formItemTagList = res || []
    loading.value = false
  }catch(e){
    formData.value.formItemTagList = []
    loading.value = false
  }
}

/** 添加 */
const add = () => {
  formData.value.formItemTagList.push({
    category: 'formItemTag',
    key:'',
    value:'',
    visible:true,
    remark:''
  })
}
/** 删除 */
const deleteTag = async (rowIndex) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    formData.value.formItemTagList.splice(rowIndex,1)
  } catch {}
}

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      await saveConfig(formData.value.formItemTagList.map(item => ({...item,name:item.value})))
      message.success('保存成功')
      emit('success')
      dialogVisible.value=false
    } else {
      message.error('表单验证失败，请检查输入')
      return false
    }
  })
  
}
</script>
<style lang="scss" scoped>
.validate-dialog-content{
  padding: 10px 20px;
}
.r-content{
  display: flex;
  .r-rangetype{
    margin-right: 4px;
  }
}
.validate-dialog-content{
  :deep(.el-form-item--default){
    margin-bottom: 0px !important;
  }
}
</style>
