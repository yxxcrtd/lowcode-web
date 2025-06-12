<template>
  <Dialog title="高级设置" v-model="dialogVisible" width="800">
    <div class="validate-dialog-content">
      <el-form ref="formRef" :model="formData" label-width="auto">
        <div class="table-content" element-loading-text="加载中">
          <vxe-table border="inner" align="center" style="width: 100%;max-height: 60vh;" v-loading="loading" :data="formData.advancedThemeList">
            <vxe-column type="seq" title="序号" width="60" align="center">
              <template #default="{ rowIndex }">
                <div class="sort">
                  <span class="sort-number">{{ rowIndex + 1 }}</span>
                  <span class="sort-action">
                    <el-icon @click="add(rowIndex)"><CirclePlusFilled /></el-icon>
                    <el-icon @click="deleteTag(rowIndex)"><RemoveFilled /></el-icon>
                  </span>
                </div>
              </template>
            </vxe-column>
            <vxe-column type="seq" title="域名" minWidth="150" align="center">
              <template #default="{ row, rowIndex }">
                <el-form-item :prop="'advancedThemeList[' + rowIndex + '].key'" :rules="rules.key">
                  <el-input v-model="row.key" ><template #prepend>https://</template></el-input>
                </el-form-item>
              </template>
            </vxe-column>
            <vxe-column field="field" title="主题" minWidth="150">
              <template #default="{ row, rowIndex }">
                <el-form-item :prop="'advancedThemeList[' + rowIndex + '].value'" :rules="rules.value">
                  <ace-select v-model="row.value" :data-source="themeOptions" placeholder="请选择"></ace-select>
                </el-form-item>
              </template>
            </vxe-column>
            <!-- <vxe-column field="action" title="操作" width="80">
              <template #default="{ rowIndex }">
                <div class="table-action">
                  <el-link type="primary" @click="deleteTag(rowIndex)">删除</el-link>
                </div>
              </template>
            </vxe-column> -->
          </vxe-table>
        </div>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" :icon="Plus" style="float: left;"  @click="add(null)"> 添加 </el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { getByCategory, saveConfig } from '../../../api'
import { CirclePlusFilled,RemoveFilled,Plus } from '@element-plus/icons-vue'
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

const themeOptions=[
  {
    label:'默认',
    value:'light'
  },
  {
    label:'红色',
    value:'red-theme'
  },
  {
    label:'夜晚',
    value:'dark'
  }
]

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
    const res = await getByCategory({ category: 'advancedThemeConfig' })
    formData.value.advancedThemeList = res || []
    loading.value = false
  }catch(e){
    formData.value.advancedThemeList = []
    loading.value = false
  }
}

/** 添加 */
const add = (rowIndex) => {
  if(rowIndex !== null){
    formData.value.advancedThemeList.splice(rowIndex + 1, 0,{
      category: 'advancedThemeConfig',
      key:'',
      value:'',
      visible:true,
      remark:''
    })
  }else{
    formData.value.advancedThemeList.push({
      category: 'advancedThemeConfig',
      key:'',
      value:'',
      visible:true,
      remark:''
    })
  }
  
}
/** 删除 */
const deleteTag = async (rowIndex) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    formData.value.advancedThemeList.splice(rowIndex,1)
  } catch {}
}

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      await saveConfig(formData.value.advancedThemeList.map(item => ({...item,name:item.value})))
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
.sort {
  .sort-number {
    //display: none;
  }
  .sort-action {
    display: none;
    i {
      font-size: 16px;
      cursor: pointer;
      color: var(--el-color-primary);
      &:nth-child(1) {
        margin-right: 5px;
      }
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
:deep(.vxe-body--row) {
  height: 56px;
  &:hover {
    .sort-number {
      display: none;
    }
    .sort-action {
      display: block;
    }
  }
}
</style>
