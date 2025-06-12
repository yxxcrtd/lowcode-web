<template>

  <div class="page-container">
    <el-tabs v-model="activeName"  @tab-change="handleChange">
      <el-tab-pane label="中台菜单" name="first">
        <MenuList ref="firstRef" />
      </el-tab-pane>
      <el-tab-pane label="后台菜单" name="second">
        <MenuList ref="secondRef"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts" setup>
import MenuList from './MenuList.vue'
import type {TabsPaneContext} from "element-plus";

defineOptions({ name: 'SystemMenuTab' })

const activeName=ref('first')
const firstRef = ref()
const secondRef = ref()
const handleChange = (name:string) => {
  if (name === 'first') {
    firstRef.value.handleQuery(1)
  } else {
    secondRef.value.handleQuery(0)
  }
}

</script>
