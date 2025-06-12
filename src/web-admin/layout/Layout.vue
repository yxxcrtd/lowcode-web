<template>
  <section class="admin-layout">
    <div class="layout-nav">
      <div class="layout-nav-menu">
        <Logo/>
        <TabMenu @show-module-menu="false"/>
      </div>
    </div>
    <div class="layout-content">
      <div class="content-header">
        <TagsView
          class=""
          style="
              transition:
                width var(--transition-time-02),
                left var(--transition-time-02);
            "
        />
        <ToolHeader/>
      </div>
      <div class="admin-content" style="transition: all var(--transition-time-02)">
        <AppView />
      </div>
    </div>
    <Setting />
  </section>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { Setting } from '@/web-admin/layout/components/Setting'
import { TabMenu } from '@/web-admin/layout/components/TabMenu'
import { TagsView } from '@/web-admin/layout/components/TagsView'
import { Logo } from '@/web-admin/layout/components/Logo'
import AppView from './components/AppView.vue'
import ToolHeader from './components/ToolHeader.vue'

const appStore = useAppStore()

// 是否是移动端
const mobile = computed(() => appStore.getMobile)

// 菜单折叠
const collapse = computed(() => appStore.getCollapse)

const layout = computed(() => 'cutMenu')

const handleClickOutside = () => {
  appStore.setCollapse(true)
}
let pageLoading = ref(false)
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-layout;

.#{$prefix-cls} {
  background-color: var(--app-content-bg-color);
  :deep(.#{$elNamespace}-scrollbar__view) {
    height: 99% !important;
  }
}
.admin-layout{
  width: 100vw;
  display: flex;
  .layout-nav{
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 10;
    display: flex;
    .layout-nav-menu{
      background-image: linear-gradient(var(--el-color-primary), var(--el-color-primary),var(--el-color-primary));

      border-right: 1px solid #e8eaed;
      //width: 100%;
     width: 85px;
    }
  }
  .layout-content{
    margin-left:85px;
    width: calc(100vw - 85px);
    .content-header{
      display: flex;
    }
  }
}
.admin-content{
  //width:calc(100vw - 270px);
  height:calc(100vh - 41px)
}
</style>
