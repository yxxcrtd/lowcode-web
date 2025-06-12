<template>
  <Dialog :title="title" v-model="dialogVisible" width="800">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100">
        <el-row>
          <el-col :span="12">
            <el-form-item label="数据库类型" prop="typeSource">
              <el-select v-model="form.typeSource" placeholder="请选择数据库类型">
                <el-option
                  v-for="item in [
                    { label: 'mysql', value: 'mysql' },
                    { label: 'oracle', value: 'oracle' }
                  ]"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字段名" prop="columnName">
              <el-input v-model="form.columnName" placeholder="请输入字段名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示名称" prop="columnComment">
              <el-input v-model="form.columnComment" placeholder="请输入显示名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字段类型" prop="columnType">
              <el-autocomplete
                class="inline-input"
                v-model="form.columnType"
                :fetch-suggestions="queryDomainSearch"
                placeholder="请选择或输入类型"
                @select="handleSelect"
              ></el-autocomplete>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="顺序" prop="columnPosition">
              <el-input-number
                v-model="form.columnPosition"
                controls-position="right"
                :min="0"
                :max="99999"
                :step="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="长度" prop="columnLength">
              <el-input-number v-model="form.columnLength" controls-position="right" :min="0" :max="99999" :step="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="小数位" prop="columnScale">
              <el-input-number v-model="form.columnScale" controls-position="right" :min="0" :max="100" :step="1" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="默认值" prop="defaultValue">
              <el-input v-model="form.defaultValue" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否主键" prop="isPrimaryKey">
              <el-checkbox v-model="form.isPrimaryKey">是</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否可空" prop="isNotNull">
              <el-checkbox v-model="form.isNotNull">是</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否自增" prop="isAutoIncrement">
              <el-checkbox v-model="form.isAutoIncrement">是</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model.number="form.remark" :rows="2" type="textarea" />
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
import { getDataDomainPage, addSysField, updateSysField, addDataDomain, updateDataDomain } from '../../../api'

defineOptions({ name: 'EditDialog' })

let title = '新增系统字段'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formType = ref('create')
const formRef = ref()
const form = ref({
  typeSource: 'mysql',
  columnName: '',
  columnComment: '',
  columnPosition: '',
  columnType: '',
  columnLength: '',
  columnScale: '',
  defaultValue: '',
  isPrimaryKey: false,
  isNotNull: false,
  isAutoIncrement: false,
  remark: null
})
const rules = reactive({
  typeSource: [{ required: true, message: '请输入数据库类型', trigger: 'blur' }],
  columnName: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
  columnComment: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  columnType: [{ required: true, message: '请选择字段类型', trigger: 'change' }]
})

let dataDomainList = ref([])
const getDataDomainList = async () => {
  const param = {
    pageNo: 1,
    pageSize: 99
  }
  const res = await getDataDomainPage(param)
  dataDomainList.value = res.list.map((item) => {
    return {
      value: item.dataType,
      ...item
    }
  })
}
getDataDomainList()

const queryDomainSearch = (queryString, cb) => {
  let results = queryString
    ? dataDomainList.value.filter((item) => {
        return item.dataType.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      })
    : dataDomainList.value
  // 调用 callback 返回建议列表的数据
  cb(results)
}
const dataDomainIdChange = (val) => {
  const selectedOption = dataDomainList.value.find((item) => item.id == val)
  if (selectedOption) {
    form.value.columnLength = selectedOption.dataLength
    form.value.columnScale = selectedOption.dataScale
  }
}

const handleSelect = (selectedOption) => {
  console.log(selectedOption)
  if (selectedOption) {
    form.value.columnLength = selectedOption.dataLength
    form.value.columnScale = selectedOption.dataScale
    form.value.dataDomainId = selectedOption.id
    form.value.columnTypeName = selectedOption.dbType
  }
}

/** 打开弹窗 */
const open = async (type: string, tableInfo) => {
  form.value = {}
  dialogVisible.value = true
  formType.value = type
  if (type === 'create') {
    title = '新增系统字段'
  } else {
    title = '编辑系统字段'
    form.value = tableInfo
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (form.value.columnTypeName) {
        form.value.columnType = form.value.columnTypeName
      }
      const res = formType.value === 'create' ? await addSysField(form.value) : await updateSysField(form.value)
      if (res) {
        message.success('保存成功！')
        dialogVisible.value = false
        form.value = {}
        emit('success', formType.value)
      } else {
        message.error('保存失败')
      }
    } else {
      return false
    }
  })
}
</script>
<style scoped lang="scss">
:deep(.el-input-number) {
  width: 100%;
}
</style>
