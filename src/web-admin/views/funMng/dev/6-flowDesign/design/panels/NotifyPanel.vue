<script setup lang="ts">
import type { NotifyNode} from '../nodes/type'
import type { Ref } from 'vue'
import type { Field } from '../Components/Render/type'
import AssigneePanel from './AssigneePanel.vue'
import {QuestionFilled} from "@element-plus/icons-vue"

const { fields } = inject<{ fields: Ref<Field[]> }>('flowDesign', { fields: ref([]) })
const { isOutProcess } = inject<{
  isOutProcess?: Ref<boolean>
}>('flowDesign', { isOutProcess: ref(false) })
const props=defineProps<{
  activeData: NotifyNode
}>()

const emit = defineEmits(['update:activeData'])
const curActiveData=computed({
  get: () => {
    return props.activeData
  },
  set: (val: NotifyNode) => {
    emit('update:activeData', val)
  }
})
</script>

<template>
  <el-form label-position="top" label-width="90px">
    <el-form-item prop="outProcessNodeId" label="外部流程节点ID" v-if="isOutProcess">
      <el-input
        v-model="curActiveData.outProcessNodeId"
        :maxlength="255"
        clearable
        placeholder="请输入外部流程ID,多个逗号分隔"
      />
    </el-form-item>
    <AssigneePanel :active-data="activeData" :fields="fields" type="通知" />
    <el-form-item prop="types" label="通知类型">
      <el-checkbox-group v-model="curActiveData.types">
        <el-checkbox label="站内" value="site" />
        <el-checkbox label="邮件" value="email" />
        <el-checkbox label="短信" value="sms" />
        <el-checkbox label="企业微信" value="wechat" />
        <el-checkbox label="钉钉" value="dingtalk" />
        <el-checkbox label="飞书" value="feishu" />
      </el-checkbox-group>
    </el-form-item>
    <el-form-item prop="subject" label="消息主题">
      <template #label>
        <div class="flex-items-center gap3px">
          <el-tooltip content="可以使用 ${字段名} 字段名填充内容" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
          <span>消息主题</span>
        </div>
      </template>
      <el-input
        v-model="curActiveData.subject"
        :maxlength="255"
        clearable
        placeholder="请输入消息主题"
      />
    </el-form-item>
    <el-form-item prop="content" label="消息内容">
      <template #label>
        <div class="flex-items-center gap3px">
          <el-tooltip content="可以使用 ${字段名} 字段名填充内容" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
          <span>消息内容</span>
        </div>
      </template>
      <el-input
        v-model="curActiveData.content"
        :autosize="{ minRows: 6, maxRows: 8 }"
        type="textarea"
        :maxlength="1000"
        show-word-limit
        placeholder="请输入消息内容"
      >
      </el-input>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
:deep(.el-tabs__content){
  padding: 0 8px;
}
:deep(.el-form-item__label){
  font-size: 12px;
  font-weight: 600;
}
:deep(.el-form-item--label-top) {
  display: block;
  padding-bottom: 10px;
  border-bottom: 1px solid #efefef;
}

</style>
