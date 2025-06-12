<template>
  <div class="page-container">
    <div class="left">
      <div class="menu-item" :class="currentId === anchorItem.id ? 'active' : ''" @click="jumpArea(anchorItem.id)" v-for="anchorItem in leftMenuList" :key="anchorItem.id">
        <div class="anchor-title">
          <span class="title">{{ anchorItem.title }}</span>
        </div>
      </div>
    </div>
    <div class="right">
      <template v-if="currentId==='cfg-sys'">
        <CfgSys/>
      </template>
      <template v-if="currentId==='cfg-theme'">
        <CfgTheme/>
      </template>
      <template v-if="currentId==='cfg-datasource'">
        <CfgDataSource/>
      </template>
      <template v-if="currentId==='cfg-rules'">
        <CfgRules/>
      </template>   
      <template v-if="currentId==='cfg-variable'">
        <CfgVariable/>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import CfgSys from "./Components/CfgSys/index.vue"
import CfgTheme from "./Components/CfgTheme/index.vue";
import CfgDataSource from "./Components/CfgDataSource/index.vue";
import CfgRules from "./Components/CfgRules/index.vue";
import CfgVariable from "./Components/CfgVariable/index.vue"

const leftMenuList = ref([
  { id: 'cfg-sys', title: '通用配置', icon: 'document' },
  { id: 'cfg-theme', title: '主题配置', icon: 'platform'},
  { id: 'cfg-datasource', title: '数据库配置', icon: 'edit-pen' },
  { id: 'cfg-rules', title: '页面规范', icon: 'setting' },
  { id: 'cfg-variable', title: '全局变量', icon: 'setting' }
])
const currentId=ref('cfg-sys')
const jumpArea=(id)=>{
  currentId.value=id;
}

onMounted(async () => {
})
</script>

<style scoped lang="scss">
.page-container{
  display: flex;
  .left{
    width: 140px;
    padding: 5px 10px 5px 3px;
    border-right: 1px solid #cccccc;
    .menu-item{
      margin: 2px 0;
      padding: 0 10px;
      line-height: 36px;
      cursor: pointer;
      font-size: 14px;
      border-radius: var(--el-border-radius-base);
      &:hover{
        background: var(--el-color-primary);
        color:#fff;
      }
      &.active{
        background: var(--el-color-primary);
        color:#fff;
      }
    }
  }
  .right{
    padding: 0px 20px;
    width: calc(100vw - 340px);
  }
  :deep(.el-tab-pane){
    height: calc(100vh - 195px);
    overflow-y: auto;
  }
  :deep(.form-content){
    width: 90%;
    margin-bottom: 30px;
  }
  :deep(.form-btn) {
    position: absolute;
    bottom: 22px;
    width: calc(100vw - 293px);
    padding: 10px 0 0 20px;
    left: 263px;
    z-index: 999;
    height: 40px;
    box-shadow: 0 -0.26042vw 0.26042vw -0.26042vw rgba(0, 0, 0, 0.5);
    text-align: left;
  }
}
</style>
