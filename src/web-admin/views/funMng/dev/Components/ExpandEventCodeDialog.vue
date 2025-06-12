<template>
  <Dialog :title="title" v-model="dialogVisible" width="1000">
    <div class="dialog-wrap">
      <CodeEditor v-model="formData.executableCode" readOnly="nocursor"></CodeEditor>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <!-- <el-button type="primary" @click="submitForm">确 定</el-button> -->
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

defineOptions({ name: 'EditDialog' })

const dialogVisible = ref(false)
const formData = ref({
  eventType: 'font',
  runTime: '',
  callType: '1',
  interfaceName: '',
  methodName: '',
  executableCode: '',
  sort: '',
  isIntercept: 0,
  interfaceUrl: '',
  interfaceParam: ''
})
const bizType = ref('create')
const title = ref('查看代码')
/** 打开弹窗 */
const open = async (type: string, eventInfo) => {
  formData.value = {}
  bizType.value = type
  dialogVisible.value = true
  if (type === 'linkage') {
    title.value = '查看代码'
    formData.value = eventInfo
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

onMounted(() => {})
</script>
<style lang="scss" scoped>
.dialog-wrap {
  display: flex;
  .left-wrap {
    width: 152px;
    height: 500px;
    border-right: 1px solid #e8eaed;
    padding: 5px 10px 5px 0;
    margin-right: 12px;
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      li {
        padding: 2px 4px;
        border-radius: 4px;
        line-height: 27px;
        margin-bottom: 4px;
        i {
          margin-right: 5px;
          top: 2px;
          font-size: 14px;
          color: #409eff;
        }
      }
      li:hover {
        background: #edf1ff;
        color: #409eff;
        cursor: pointer;
      }
      .active {
        background: #edf1ff;
        color: #409eff;
        cursor: pointer;
      }
    }
  }
}
.edit-content {
  border: 1px solid #d7d7d7;
  border-radius: 4px;
  padding: 14px 10px;
}
.filter-list {
  margin-top: 10px;
  .filter-item {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin-bottom: 8px;

    .item-remove {
      font-size: 14px;
      margin: 0 15px;
    }
    > div {
      margin: 0 2px;
    }
  }
}
</style>
