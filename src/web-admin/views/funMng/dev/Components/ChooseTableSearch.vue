<template>
  <Dialog
    v-model="dialogVisible"
    :title="title"
    width="900"
  >
    <div class="dialog-content">
      <el-form :model="formData" ref="formRef" label-width="110">
        <el-row>
          <el-col :span="12">
            <el-form-item label="主键范围" prop="parameterType">
              <el-select v-model="formData.parameterType" placeholder="请选择范围类型">
                <el-option v-for="item in paramterOptions" :key="'parameter_'+item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.parameterType=='parameter'">
            <el-form-item label="参数名" prop="parameterName">
              <el-input v-model="formData.parameterName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="说明" prop="tableRemark">
              <el-input v-model="formData.tableRemark"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="其他查询条件" prop="searchSql">
              <div class="code-input-content">
                <CodeEditor v-model="formData.searchSql"></CodeEditor>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

// 普通输入框
import {cloneDeep} from "lodash-es";

defineOptions({ name: 'CodeInput' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const title=ref('设置查询条件')
const formData=ref({
  parameterType:null,
  parameterName:null,
  tableRemark:null,
  searchSql:null
})

const paramterOptions=ref([
  {label:'参数',value:'parameter'}
])
/** 打开弹窗 */
const open = async (data) => {
  dialogVisible.value = true
  if (data) {
    formData.value = data
  }else{
    formData.value={}
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗


const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  emit('success', cloneDeep(formData.value))
  dialogVisible.value = false
}

</script>

<style scoped lang="scss">
.dialog-content{
  text-align: left;
  .code-input-content{
    width: 100%;
    height: 368px;
  }
}
</style>
