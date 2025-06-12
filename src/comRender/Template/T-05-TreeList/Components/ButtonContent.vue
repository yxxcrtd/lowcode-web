<template>
  <div class="button-content">
    <div class="left">
      <template v-for="(item,index) in pageButtonsLeft" :key="'left_Buttons_'+index">
        <el-button v-bind:[item.buttonShape]="true" :type="item.buttonStyle"  @click="handleClick(item)">
          <Icon v-if="item.buttonIcon" :icon="item.buttonIcon" class="mr-5px" />
          {{ item.buttonName }}
        </el-button>
      </template>
    </div>
    <div class="right">
      <template v-for="(item,index) in pageButtonsRight" :key="'right_Buttons_'+index">
        <el-button v-bind:[item.buttonShape]="true" :type="item.buttonStyle" @click="handleClick(item)">
          <Icon v-if="item.buttonIcon" :icon="item.buttonIcon" class="mr-5px" />
          {{ item.buttonName }}
        </el-button>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref,inject} from 'vue'

const pageInfo =inject('pageInfo')
const pageButtonsLeft = (pageInfo.pageButtons || []).filter(item=>['left'].includes(item.buttonType))
const pageButtonsRight = (pageInfo.pageButtons || []).filter(item=>['right'].includes(item.buttonType))
console.log(pageButtonsLeft,pageButtonsRight)

/**
 * 按钮事件处理，统一发送到父级组件处理
 */
const emits=defineEmits(["btnEvent"])
const handleClick=(btnItem)=>{
  emits("btnEvent",btnItem)
}
</script>
<style scoped lang="scss">
.button-content{
  padding: 8px 10px;
  display: flex;
  color: #000;
  justify-content: space-between;
}
</style>
