<template>
  <draggable :list="childrenData" itemKey="id" animation="0" @start="onStart" @end="onEnd" :class="[{'isGroup':isGroup}] ">
    <template #item="{ element }">
      <div style="position: relative;margin: 0 20px;">
        <div
          class="draggable_item"
          :style="{
            backgroundColor: element.isdraggable // 通过isdraggable区分是否能拖拽的颜色
              ? '#ffffff'
              : 'rgba(0, 0, 0, 0.04)',
            color: element.isdraggable ? 'rgba(0, 0, 0, 0.88)' : 'rgba(0, 0, 0, 0.25)'
          }"
        >
          <div class="draggable_item-left" :style="{ marginLeft: `${(element.level - 1) * 16}px` }">
            <div class="icon" @click="showTreeInfo(element)">
              <el-icon><Rank /></el-icon>
            </div>
            <div class="name">
              <span>{{ element.fieldName }}{{element.operate}}{{element.value}}</span>
            </div>
          </div>
        </div>
        <ExpressionConfig
          :originData="originData"
          :childrenData="element.children"
          @handle-change="handleChange"
          @start-handle-change="startHandleChange"
          :isGroup="true"
          v-if="element.children"
        />
        <div class="line">
          <span class="operator">AND</span>
        </div>
      </div>
    </template>
  </draggable>
</template>
<script lang="ts" setup name="ExpressionConfig">
import draggable from 'vuedraggable'
import {Rank} from "@element-plus/icons-vue"

const props = defineProps({
  // 整个数据对象
  originData: {
    type: Array,
    default: () => {
      return []
    }
  },
  // 数据对象中的子节点
  childrenData: {
    type: Array,
    default: () => {
      return []
    }
  },
  isGroup:{
    type:Boolean,
    default:false
  }
})

const emit = defineEmits(['handleChange', 'startHandleChange', 'initHandleChange'])

//拖拽开始的事件
const onStart = (event) => {
  const { element } = event.item.__draggable_context
  // 拖拽开始时处理数据（向父组件发送消息）
  emit('startHandleChange', element.level)
}

// 递归组件中介函数
const startHandleChange = (level) => {
  emit('startHandleChange', level)
}

//拖拽结束的事件
const onEnd = () => {
  // 拖拽结束后重新处理数据，参数：原数据，变化的数据（向父组件发送消息）
  emit('handleChange', props.originData, props.childrenData)
}

// 递归组件中介函数
const handleChange = (data1, data2) => {
  emit('handleChange', data1, data2)
}

// 侧边小图标点击事件
const showTreeInfo = (ele) => {
  if (ele.children) {
    ele.open = !ele.open
  }
}
</script>
<style lang="scss" scoped>
.draggable_item {
  padding: 0px 12px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 2px;
  margin-bottom: 4px;

  .item-group{
    background: #f2f4f5;
    border-radius: 4px;
  }
  .draggable_item-left {
    display: flex;
    align-items: center;
    max-width: 260px;

    .icon {
      margin-right: 10px;
      width: 14px;
    }
    .name{
      border: 1px solid #e0e6eb;
      box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.02);
      border-radius: 10%;
      padding: 2px 10px;
    }
  }

}
.isGroup{
  background: #f2f4f5;
  padding: 4px 8px;
  border-radius: 10px;
  margin-left: 18px;
}
.line{
  position: absolute;
  top: 10px;
  height: calc(100% - 16px);
  width: 10px;
  border: 2px solid #1e84d9;
  border-right: none;
  border-radius: 5px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  .operator{
    position: absolute;
    top: 42%;
    display: inline-block;
    left: -20px;
    background: #bfbfbf;
    font-size: 12px;
    padding: 4px 5px;
    border-radius: 10px;
  }
}
</style>
