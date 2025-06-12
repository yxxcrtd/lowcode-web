<script lang="ts" setup>
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'
import { Footer } from '@/web-admin/layout/components/Footer'

defineOptions({ name: 'AppView' })

const appStore = useAppStore()

const layout = computed(() => appStore.getLayout)

const fixedHeader = computed(() => appStore.getFixedHeader)

const footer = computed(() => appStore.getFooter)

const tagsViewStore = useTagsViewStore()

const getCaches = computed((): string[] => {
  return tagsViewStore.getCachedViews
})

const tagsView = computed(() => appStore.getTagsView)

//region 无感刷新
const routerAlive = ref(true)
// 无感刷新，防止出现页面闪烁白屏
const reload = () => {
  routerAlive.value = false
  nextTick(() => (routerAlive.value = true))
}
// 为组件后代提供刷新方法
provide('reload', reload)
//endregion
</script>

<template>
  <section class="main-container">
    <div class="main-content">
      <router-view v-if="routerAlive">
        <template #default="{ Component, route }">
          <keep-alive :include="getCaches">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </template>
      </router-view>
    </div>
  </section>
</template>
<style scoped lang="scss">
.main-container{
  padding:12px;
  box-sizing: border-box;
  width:100%;
  background-color: #f0f2f5;
  height:calc(100vh - 40px);
  .main-content{
    height: 100%;
    //background-color: #fff;
    //padding:15px;
  }
}
</style>
