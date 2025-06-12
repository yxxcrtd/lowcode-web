<template>
  <el-tabs v-model="activeName" @tab-change="handleClick">
    <el-tab-pane label="基础配置" name="baseConfig">
      <el-form
        ref="baseConfigFormRef"
        :rules="rules"
        :model="formData"
        label-width="auto"
        class="form-content"
        status-icon
      >
        <div class="content">
          <el-col :span="24">
            <el-form-item label="标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入系统标题" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="关键字" prop="keyword">
              <el-input v-model="formData.keyword" placeholder="请输入系统关键字" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="formData.description" :rows="2" type="textarea" placeholder="请输入系统描述" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="域名" prop="host">
              <el-input v-model="formData.host" style="max-width: 600px" placeholder="请输入系统域名">
                <template #prepend>Http://</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="系统图标" prop="logo">
              <el-upload
                class="avatar-uploader"
                action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="formData.logo" :src="formData.logo" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </div>
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="安全配置" name="safeConfg">
      <el-form
        ref="safeConfigFormRef"
        :rules="rules"
        :model="formData"
        label-width="auto"
        class="form-content"
        status-icon
      >
        <div class="content">
          <el-col :span="24">
            <el-form-item label="登陆方式配置" prop="loginMethod1">
              <el-checkbox-group v-model="formData.loginMethod1">
                <el-checkbox
                  v-for="(item, index) in loginTypeOption"
                  :key="'logintype-' + index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="登陆验证码" prop="verifyCode">
              <ace-switch v-model="formData.verifyCode"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="显示水印" prop="watermark">
              <ace-switch v-model="formData.watermark"/>
            </el-form-item>
          </el-col>
        </div>
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="系统参数" name="sysParamter">
      <div class="tab-content">
        <div class="btn mb-10px">
          <el-button type="primary" @click="openParamterDialog('create')">新增系统参数</el-button>
        </div>
        <JVxeTable
          ref="jVxeTable"
          :columns="sysParamterColumns"
          :row-height="58"
          height="auto" 
          :data-url="'/infra/config/page'"
          :search-params="queryParam"
        >
          <template #action_default="{ row }">
            <div class="table-action">
              <el-link type="primary" @click="openParamterDialog('edit', row)">编辑</el-link>
              <el-divider direction="vertical" />
              <el-link type="primary" @click="handleDel(row.id)">删除</el-link>
            </div>
          </template>
        </JVxeTable>
        <CfgSysParamter ref="paramterDialogRef" @success="refreshTable" />
      </div>
    </el-tab-pane>
  </el-tabs>
  <div class="form-btn" v-if="activeName!='sysParamter'">
    <el-button type="primary" @click="submitForm(1)"> 保存 </el-button>
  </div>
</template>
<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { sysParamterColumns } from '../../data'
import CfgSysParamter from './Components/Paramter.vue'
import { getByCategory,createBase, createSecurity, deleteParam, getBase, getSecurity, saveConfig } from '../../api'

const activeName = ref('baseConfig')
const message = useMessage() // 消息弹窗
const baseConfigFormRef = ref()
const safeConfigFormRef = ref()
const formData = ref([])
const jVxeTable = ref()
const queryParam = ref({})
const rules = reactive({
})

// 基础配置 表单
const baseForm = [
  {
    category: 'baseConfig',
    key: 'title',
    name: '标题',
    value: null,
    visible: true
  },
  {
    category: 'baseConfig',
    key: 'keyword',
    name: '关键字',
    value: null,
    visible: true
  },
  {
    category: 'baseConfig',
    key: 'description',
    name: '描述',
    value: null,
    visible: true
  },
  {
    category: 'baseConfig',
    key: 'host',
    name: '域名',
    value: null,
    visible: true
  },
  {
    category: 'baseConfig',
    key: 'logo',
    name: '系统图标',
    value: null,
    visible: true
  },
  {
    category: 'safeConfig',
    key: 'loginMethod',
    name: '登陆方式配置',
    value: null,
    visible: true
  },
  {
    category: 'safeConfig',
    key: 'verifyCode',
    name: '登陆验证码',
    value: null,
    visible: true
  },
  {
    category: 'safeConfig',
    key: 'watermark',
    name: '显示水印',
    value: null,
    visible: true
  }
]
// const baseSchema = computed(() => {
//   // 前缀插槽
//   return baseForm.value.map(item => ({
//     ...item,
//     field: item.key,
//     label: item.name,
//     component: 'Input'
//   }))
// })

queryParam.value = {
  category: 'Sys-Paramter'
}
formData.value = {
  title: '',
  keyword: '',
  description: '',
  host: '',
  logo: null,
  loginMethod1: [],
  verifyCode: false,
  watermark: false
}

/**
 * 获取数据
 */
const getData = async (type) => {
  const res = await getByCategory({ category: type || activeName.value })
  res.forEach((item) => {
    if(item.key === 'loginMethod'){
      formData.value[item.key] = item.value.split(',')
    }else{
      formData.value[item.key] = item.value
    }
  })
  // const res = await getBase()
  // formData.value = { ...res }
  // const res1 = await getSecurity()
  // if (res1.loginMethod) {
  //   formData.value.loginMethod1 = res1.loginMethod.split(',')
  // }
  // formData.value.verifyCode = res1.verifyCode
  // formData.value.watermark = res1.watermark
}
getData(activeName.value)
//tab切换时获取数据
const handleClick = async () => {
  await getData(activeName.value)
  nextTick(() => {
    baseConfigFormRef.value.clearValidate()
    safeConfigFormRef.value.clearValidate()
  })
}
/**
 * 保存
 */
const submitForm = async () => {
  if (activeName.value === 'baseConfig') {
    baseConfigFormRef.value.validate(async (valid) => {
      if (valid) {
        const params = baseForm
          .filter((item) => item.category === 'baseConfig')
          .map((item) => ({
            ...item,
            value: formData.value[item.key]
          }))
          .filter((item) => ![null, undefined, ''].includes(item.value))
        await saveConfig(params)
        message.success('保存成功')
        getData(activeName.value)
      }
    })
  } else if (activeName.value === 'safeConfg') {
    safeConfigFormRef.value.validate(async (valid) => {
      if (valid) {
        const params = baseForm
          .filter((item) => item.category === 'safeConfig')
          .map((item) => ({
            ...item,
            value: item.key === 'loginMethod' ? formData.value.loginMethod1.join(',') : formData.value[item.key]
          }))
          .filter((item) => ![null, undefined].includes(item.value))
        await saveConfig(params)
        message.success('保存成功')
        getData(activeName.value)
      }
    })
  }
}

const imageUrl = ref('')

const loginTypeOption = ref([
  {
    label: '账号密码登陆',
    value: '1'
  },
  {
    label: '手机号登陆',
    value: '2'
  }
])

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
/**
 * 新增、编辑表弹框
 */
const paramterDialogRef = ref()
const openParamterDialog = (type: string, row) => {
  paramterDialogRef.value.open(type, row)
}

const refreshTable = () => {
  jVxeTable.value?.refresh()
}

/**
 * 删除
 * @param id
 */
const handleDel = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await deleteParam(id)
    message.success('删除成功')
    // 刷新列表
    refreshTable()
  } catch {}
}
onMounted(async () => {})
</script>

<style scoped lang="scss">
.form-content {
  width: 100%;
  height: calc(100% - 32px);
  .content {
    width: 100%;
  } 
}
.tab-content {
  .btn {
    margin-bottom: 10px;
  }
  :deep(.j-vxe-table){
    height: calc(100vh - 270px);
  }
}
</style>
