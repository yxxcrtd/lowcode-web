<template>
  <el-tabs v-model="activeName" class="cfg-tabs" @tab-change="handleClick">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="auto" class="demo-formData" status-icon>
      <el-tab-pane label="表单规范" name="formStandard">
        <div class="content" v-if="activeName === 'formStandard'">
          <div class="flex-50 form-item">
            <el-form-item label="标签的长度" prop="labelWidth">
              <el-input v-model="formData.labelWidth" type="number" />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="星号位置" prop="requireTagPosition">
              <el-select v-model="formData.requireTagPosition">
                <el-option label="左" value="left" />
                <el-option label="右" value="right" />
              </el-select>
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="行内表单模式" prop="formInline">
              <el-switch
                v-model="formData.formInline"
                inline-prompt
                active-text="是"
                active-value="1"
                inactive-text="否"
                inactive-value="0"
              />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="标签是否显示冒号" prop="labelShowColon">
              <el-switch
                v-model="formData.labelShowColon"
                inline-prompt
                active-text="是"
                active-value="1"
                inactive-text="否"
                inactive-value="0"
              />
            </el-form-item>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="表格规范" name="tableStandard">
        <div class="content" v-if="activeName === 'tableStandard'">
          <div class="flex-50 form-item">
            <el-form-item label="显示行号" prop="tableLine">
              <el-switch
                v-model="formData.tableLine"
                inline-prompt
                active-text="是"
                active-value="1"
                inactive-text="否"
                inactive-value="0"
              />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="每页行号默认起始" prop="tableBeginIndex">
              <el-radio-group v-model="formData.tableBeginIndex">
                <el-radio value="Y">从1开始</el-radio>
                <el-radio value="N">根据记录开始</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="斑马纹" prop="tableStripes">
              <el-switch
                v-model="formData.tableStripes"
                inline-prompt
                active-text="是"
                active-value="1"
                inactive-text="否"
                inactive-value="0"
              />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="固定操作列" prop="tableFixedAction">
              <el-switch
                v-model="formData.tableFixedAction"
                inline-prompt
                active-text="是"
                active-value="1"
                inactive-text="否"
                inactive-value="0"
              />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="操作列位置" prop="tableActionPostion">
              <el-select v-model="formData.tableActionPostion">
                <el-option label="左" value="left" />
                <el-option label="右" value="right" />
              </el-select>
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="默认分页大小" prop="tableDefPageSize">
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
      </el-tab-pane>
      <el-tab-pane label="弹框规范" name="dialogStandard">
        <div class="content" v-if="activeName === 'dialogStandard'">
          <div class="flex-50 form-item">
            <el-form-item label="是否允许拖动" prop="dialogCanDrag">
              <el-switch
                v-model="formData.dialogCanDrag"
                inline-prompt
                active-text="是"
                active-value="1"
                inactive-text="否"
                inactive-value="0"
              />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="是否允许放大缩小" prop="dialogCanZoom">
              <el-switch
                v-model="formData.dialogCanZoom"
                inline-prompt
                active-text="是"
                active-value="1"
                inactive-text="否"
                inactive-value="0"
              />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="是否显示蒙层" prop="dialogShowModal">
              <el-switch
                v-model="formData.dialogShowModal"
                inline-prompt
                active-text="是"
                active-value="1"
                inactive-text="否"
                inactive-value="0"
              />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="是否点击蒙层关闭" prop="dialogCloseOnClickModal">
              <el-switch v-model="formData.dialogCloseOnClickModal" inline-prompt active-text="是" inactive-text="否" />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="弹框样式名" prop="dialogCustomClass">
              <el-input v-model="formData.dialogCustomClass" />
            </el-form-item>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="抽屉规范" name="drawerStandard">
        <div class="content" v-if="activeName === 'drawerStandard'">
          <div class="flex-50 form-item">
            <el-form-item label="是否显示蒙层" prop="drawerShowModal">
              <el-switch
                v-model="formData.drawerShowModal"
                inline-prompt
                active-text="是"
                active-value="1"
                inactive-text="否"
                inactive-value="0"
              />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="点击蒙层关闭" prop="dialogCloseOnClickModal">
              <el-switch
                v-model="formData.dialogCloseOnClickModal"
                inline-prompt
                active-text="是"
                active-value="1"
                inactive-text="否"
                inactive-value="0"
              />
            </el-form-item>
          </div>
          <div class="flex-50 form-item">
            <el-form-item label="抽屉样式名" prop="dialogCustomClass">
              <el-input v-model="formData.dialogCustomClass" />
            </el-form-item>
          </div>
        </div>
      </el-tab-pane>
    </el-form>
  </el-tabs>
  <div class="form-btn">
    <el-button type="primary" @click="submitForm()"> 保存 </el-button>
  </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { ref } from 'vue'
import { getByCategory, getBase, getSecurity, saveConfig } from '../../api'

const message = useMessage() // 消息弹窗
const activeName = ref('formStandard')
const formData = ref([])
const formRef = ref()
const baseForm = [
  {
    category: 'formStandard',
    key: 'labelWidth',
    name: '标签的长度',
    value: null,
    visible: true
  },
  {
    category: 'formStandard',
    key: 'requireTagPosition',
    name: '星号位置',
    value: null,
    visible: true
  },
  {
    category: 'formStandard',
    key: 'formInline',
    name: '行内表单模式',
    value: null,
    visible: true
  },
  {
    category: 'formStandard',
    key: 'labelShowColon',
    name: '标签是否显示冒号',
    value: null,
    visible: true
  },
  {
    category: 'tableStandard',
    key: 'tableLine',
    name: '显示行号',
    value: null,
    visible: true
  },
  {
    category: 'tableStandard',
    key: 'tableBeginIndex',
    name: '每页行号默认起始',
    value: null,
    visible: true
  },
  {
    category: 'tableStandard',
    key: 'tableStripes',
    name: '斑马纹',
    value: null,
    visible: true
  },
  {
    category: 'tableStandard',
    key: 'tableFixedAction',
    name: '固定操作列',
    value: null,
    visible: true
  },
  {
    category: 'tableStandard',
    key: 'tableActionPostion',
    name: '操作列位置',
    value: null,
    visible: true
  },
  {
    category: 'tableStandard',
    key: 'tableDefPageSize',
    name: '默认分页大小',
    value: null,
    visible: true
  },
  {
    category: 'dialogStandard',
    key: 'dialogCanDrag',
    name: '是否允许拖动',
    value: null,
    visible: true
  },
  {
    category: 'dialogStandard',
    key: 'dialogCanZoom',
    name: '是否允许放大缩小',
    value: null,
    visible: true
  },
  {
    category: 'dialogStandard',
    key: 'dialogShowModal',
    name: '是否显示蒙层',
    value: null,
    visible: true
  },
  {
    category: 'dialogStandard',
    key: 'dialogCloseOnClickModal',
    name: '是否点击蒙层关闭',
    value: null,
    visible: true
  },
  {
    category: 'dialogStandard',
    key: 'dialogCustomClass',
    name: '弹框样式名',
    value: null,
    visible: true
  },
  {
    category: 'drawerStandard',
    key: 'drawerShowModal',
    name: '是否显示蒙层',
    value: null,
    visible: true
  },
  {
    category: 'drawerStandard',
    key: 'dialogCloseOnClickModal',
    name: '点击蒙层关闭',
    value: null,
    visible: true
  },
  {
    category: 'drawerStandard',
    key: 'dialogCustomClass',
    name: '抽屉样式名',
    value: null,
    visible: true
  }
]
const rules = computed(() => ({
}))

const getData = async (type) => {
  const res = await getByCategory({ category: type || activeName.value })
  res.forEach((item) => {
    formData.value[item.key] = item.value
  })
}
getData(activeName.value)
//tab切换时获取数据
const handleClick = async () => {
  await getData(activeName.value)
  nextTick(() => {
    formRef.value.clearValidate()
  })
}
//提交form表单
const submitForm = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const params = baseForm
        .filter((item) => item.category === activeName.value)
        .map((item) => ({
          ...item,
          value: formData.value[item.key]
        }))
        .filter((item) => ![null, undefined, ''].includes(item.value))
      await saveConfig(params)
      message.success('保存成功')
      getData(activeName.value)
    } else {
      console.log('error submit!')
    }
  })
}

const imageUrl = ref('')

const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  console.log(response)
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}
onMounted(async () => {})
</script>

<style scoped lang="scss">
.from-content {
  width: 100%;
  position: relative;
  .content {
    display: flex;
    flex-wrap: wrap;

    .form-item {
      padding: 15px;
      box-sizing: border-box;
    }

    .flex-100 {
      flex-basis: 100%;
    }

    .flex-50 {
      flex-basis: 50%;
    }
  }

  .form-btn {
    margin-top: 10px;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
