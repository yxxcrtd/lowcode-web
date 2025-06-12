<template>
  <el-dialog :title="title" v-model="dialogVisible" width="800">
    <div class="dialog-wrap" style="padding-top: 10px">
      <el-form :model="form" ref="formRef" label-width="110">
        <el-form-item label="组件名称" prop="componentName" >
          {{form.componentName}}
        </el-form-item>
        <el-form-item label="组件编码" prop="componentCode" style="padding-top: 5px;">
          {{form.componentCode}}
        </el-form-item>
        <el-form-item label="组件属性" style="padding-top: 5px;">
          <vxe-table border="inner" style="width: 100%" :data="form.attributeList">
            <vxe-column field="attributeName" title="属性名称" width="200">
              <template #default="{ row, rowIndex }">
                <el-form-item :prop="'attributeList[' + rowIndex + '].attributeName'" >
                  <el-input v-model="row.attributeName" :disabled="true"></el-input>
                </el-form-item>
              </template>
            </vxe-column>
            <vxe-column field="attributeType" title="属性类型" width="180">
              <template #default="{ row, rowIndex }">
                <el-form-item :prop="'attributeList[' + rowIndex + '].attributeType'" >
                  <el-input v-model="row.attributeType" :disabled="true"></el-input>
                </el-form-item>
              </template>
            </vxe-column>
            <vxe-column field="attributeValue" title="属性值" width="300">
              <template #default="{ row, rowIndex }">
                <el-form-item :prop="'attributeList[' + rowIndex + '].attributeValue'" v-if="row.attributeType !=='boolean' ">
                  <el-input v-model="row.attributeValue" ></el-input>
                </el-form-item>
                <el-form-item :prop="'attributeList[' + rowIndex + '].attributeValue'" v-if="row.attributeType ==='boolean' ">
                  <el-switch v-model="row.attributeValue" inline-prompt active-text="是" inactive-text="否" />
                </el-form-item>
              </template>
            </vxe-column>
          </vxe-table>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="okForm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { getComponent} from '../api'

defineOptions({ name: 'EditDialog' })
const props = defineProps({
  okData: Array
})
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formRef = ref()
const form = ref({
  id: null,
  componentName: '',
  componentCode: '',
  attributeList: [
    {
      attributeName: '',
      attributeType: '',
      attributeValue: ''
    }
  ]
})
const title = ref<string>('组件属性设置')

/** 打开弹窗 */
const open = async (id?: string) => {
  const comRes = await getComponent(id)
  form.value = {
    id: id,
    componentName: comRes.componentName,
    componentCode: comRes.componentCode,
    attributeList: comRes.componentAttributeList
  }
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
const emit = defineEmits(['saveAttribute']) // 定义 success 事件，用于操作成功后的回调
const okForm = () => {
  console.log(form.value.attributeList)
  emit('saveAttribute', form.value.attributeList)
  dialogVisible.value = false
}
</script>
<style lang="scss" scoped>
.dialog-wrap {
  height: 300px;
}
el-form-item {padding-top: 10px;}
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
