<template>
  <el-tabs v-model="activeName" class="cfg-tabs" @tab-change="handleClick">
    <el-tab-pane v-loading="themeLoading" label="主题配置" name="themeConfig">
      <el-form ref="ruleFormRef" :rules="rules" label-width="auto" class="form-content" status-icon>
        <div class="content">
          <span class="subtitle">布局</span>
          <CfgThemeLoyout ref="cfgThemeLoyoutRef" v-model="formData.layout" />
          
          <div class="flex subtitle-div">
            <span class="subtitle">主题</span>
            <el-button link type="primary" size="small" @click="openThemeDialog">高级设置</el-button>
          </div>
          <CfgThemeImg
            ref="cfgThemeColorRef"
            v-model="formData.systemTheme"
            @success="submitForm"
          />
        </div>
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="字体配置" name="themeFont">
      <el-form
        ref="themeFontFormRef"
        :rules="rules"
        :model="formData"
        label-width="auto"
        class="form-content"
        status-icon
      >
        <div class="content">
          <span class="subtitle">默认</span>
          <el-col :span="12">
            <el-form-item label="字体" prop="font_style">
              <ace-select v-model="formData.font_style" :data-source="fontFamilyOptions" placeholder="请设置字体"></ace-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字体大小" prop="font_size">
              <el-input v-model="formData.font_size" placeholder="请设置字体大小"  type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字体颜色" prop="font_color">
              <el-input v-model="formData.font_color" placeholder="请设置字体颜色" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加粗" prop="font_bold">
              <el-input v-model="formData.font_bold" placeholder="请设置加粗"  type="number"/>
            </el-form-item>
          </el-col>
          <span class="subtitle">表单标签</span>
          <el-col :span="12">
            <el-form-item label="字体" prop="form_font_style">
              <ace-select v-model="formData.form_font_style" :data-source="fontFamilyOptions" placeholder="请设置字体"></ace-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字体大小" prop="form_font_size">
              <el-input v-model="formData.form_font_size" placeholder="请设置字体大小" type="number"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字体颜色" prop="form_font_color">
              <el-input v-model="formData.form_font_color" placeholder="请设置字体颜色" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加粗" prop="form_font_bold">
              <el-input v-model="formData.form_font_bold" placeholder="请设置加粗" type="number" />
            </el-form-item>
          </el-col>
          <span class="subtitle">卡片标题</span>
          <el-col :span="12">
            <el-form-item label="字体" prop="card_font_style">
              <ace-select v-model="formData.card_font_style" :data-source="fontFamilyOptions" placeholder="请设置字体"></ace-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字体大小" prop="card_font_size">
              <el-input v-model="formData.card_font_size" placeholder="请设置字体大小"  type="number"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字体颜色" prop="card_font_color">
              <el-input v-model="formData.card_font_color" placeholder="请设置字体颜色" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加粗" prop="card_font_bold">
              <el-input v-model="formData.card_font_bold" placeholder="请设置加粗"  type="number"/>
            </el-form-item>
          </el-col>
        </div>
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="其他配置" name="third"></el-tab-pane>
  </el-tabs>
  <div class="form-btn">
    <el-button type="primary" @click="submitForm(1)"> 保存 </el-button>
  </div>
  <AdvancedThemeDialog ref="advancedThemeDialogRef"/>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { saveConfig, getByCategory } from '../../api'
import CfgThemeLoyout from './Components/Layout.vue'
import CfgThemeImg from './Components/ThemeImg.vue'
import AdvancedThemeDialog from './Components/AdvancedThemeDialog.vue'

const message = useMessage() // 消息弹窗
const activeName = ref('themeConfig')
const formData = ref({})
const themeFontFormRef = ref()
const cfgThemeLoyoutRef = ref()
const cfgThemeColorRef = ref()
const rules = reactive({
})
const baseForm = [
  {
    category: 'themeConfig',
    key: 'layout',
    name: '布局',
    value: null,
    visible: true
  },
  {
    category: 'themeConfig',
    key: 'systemTheme',
    name: '系统主题',
    value: null,
    visible: true
  },
  // {
  //   category: 'themeConfig',
  //   key: 'systemThemeColor',
  //   name: '系统主题',
  //   value: null,
  //   visible: true
  // },
  // {
  //   category: 'themeConfig',
  //   key: 'headerThemeColor',
  //   name: '头部主题',
  //   value: null,
  //   visible: true
  // },
  // {
  //   category: 'themeConfig',
  //   key: 'menuThemeColor',
  //   name: '菜单主题',
  //   value: null,
  //   visible: true
  // },
  {
    category: 'themeFont',
    key: 'font_style',
    name: '字体',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'font_size',
    name: '字体大小',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'font_color',
    name: '字体颜色',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'font_bold',
    name: '加粗',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'form_font_style',
    name: '字体',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'form_font_size',
    name: '字体大小',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'form_font_color',
    name: '字体颜色',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'form_font_bold',
    name: '加粗',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'card_font_style',
    name: '字体',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'card_font_size',
    name: '字体大小',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'card_font_color',
    name: '字体颜色',
    value: null,
    visible: true
  },
  {
    category: 'themeFont',
    key: 'card_font_bold',
    name: '加粗',
    value: null,
    visible: true
  }
]
const getData = async (type) => {
  const res = await getByCategory({ category: type || activeName.value })
  res.forEach((item) => {
    formData.value[item.key] = item.value
  })
}
getData(activeName.value)
//tab切换时获取数据
const handleClick = () => {
  getData(activeName.value)
}

const themeLoading = ref(false)
const submitForm = async () => {
  if (activeName.value==='themeConfig') {
    themeLoading.value = true
    try{
      const params = baseForm
      .filter((item) => item.category === 'themeConfig')
      .map((item) => ({
        ...item,
        value: formData.value[item.key]
      }))
      .filter((item) => ![null, undefined].includes(item.value))
      await saveConfig(params)
      message.success('保存成功')
      getData(activeName.value)
      themeLoading.value = false
    }catch(e){
      themeLoading.value = false
    }
  } else if (activeName.value==='themeFont') {
    themeFontFormRef.value.validate(async (valid) => {
      if (valid) {
        const params = baseForm
          .filter((item) => item.category === 'themeFont')
          .map((item) => ({
            ...item,
            value: formData.value[item.key]
          }))
          .filter((item) => ![null, undefined].includes(item.value))
        await saveConfig(params)
        message.success('保存成功')
        getData(activeName.value)
      } else {
        console.log('error submit!')
      }
    })
  }
}

//打开高级设置弹框
const advancedThemeDialogRef = ref()
const openThemeDialog = () => {
  advancedThemeDialogRef.value.open()
}

onMounted(async () => {})
</script>

<style scoped lang="scss">
.cfg-tabs{
  :deep(.el-tab-pane){
    height: calc(100vh - 230px) !important;
    overflow-y: auto;
  }
  .form-content {
    width: 100%;
    position: relative;

    .form-btn {
      margin-top: 10px;
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  .subtitle {
    display: inline-block;
    width: 100%;
    border-bottom: 1px solid #e9e4e4;
    margin: 5px 0 15px;
    padding: 5px 0 5px 8px;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      width: 6px;
      height: 16px;
      background: var(--el-color-primary);
      top: 9px;
      left: -3px;
    }
  }
  .subtitle-div{
    width: 100%;
    border-bottom: 1px solid #e9e4e4;
    margin: 5px 0 15px;
    .subtitle{
      border: 0;
      margin: 0;
    }
  }
  .tab-content {
    .btn {
      margin-bottom: 10px;
    }
  }
}

</style>
