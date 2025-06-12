<template>
  <div class="theme-content">
    <div class="two box">
      <div class="box-title">{{ t('setting.systemTheme') }}</div>
      <div class="flex align-center">
        <div class="mr-10px">
          <ColorRadioPicker v-model="systemTheme" :schema="['#409eff', '#009688', '#536dfe', '#ff5c93', '#ee4f12', '#0096c7', '#9c27b0', '#ff9800']" @change="setSystemThemeColor" />
        </div>
        <div class="">
          <color-input v-model="systemTheme" @update:model-value="(value) => getCurrentValue(value, '1')" />
        </div>
      </div>
    </div>
    <div class="thr box">
      <div class="box-title">{{ t('setting.headerTheme') }}</div>
      <div class="flex align-center">
        <div class="mr-10px">
          <ColorRadioPicker v-model="headerTheme" :schema="['#fff', '#151515', '#5172dc', '#e74c3c', '#24292e', '#394664', '#009688', '#383f45']" @change="setHeaderThemeColor" />
        </div>
        <div class="">
          <color-input v-model="headerTheme" @update:model-value="(value) => getCurrentValue(value, '2')" />
        </div>
      </div>

      <!-- 菜单主题 -->
      <template v-if="layout !== 'top'">
        <div class="box-title">{{ t('setting.menuTheme') }}</div>
        <div class="flex align-center">
          <div class="mr-10px">
            <ColorRadioPicker v-model="menuTheme" :schema="['#fff', '#001529', '#212121', '#273352', '#191b24', '#383f45', '#001628', '#344058']" @change="setMenuThemeColor" />
          </div>
          <div class="">
            <color-input v-model="menuTheme" @update:model-value="(value) => getCurrentValue(value, '3')" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/store/modules/app'
import { computed } from 'vue'
import ColorRadioPicker from '@/web-admin/layout/components/Setting/src/components/ColorRadioPicker.vue'
import ColorInput from '@/components/ColorInput/index.vue'
import { setCssVar, trim } from '@/utils'
import { useClipboard, useCssVar } from '@vueuse/core'
// import { useWatermark } from '@/hooks/web/useWatermark'
import { colorIsDark, hexToRGB, lighten } from '@/utils/color'
import { ElMessage } from 'element-plus'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { propTypes } from '@/utils/propTypes'
const { t } = useI18n()
defineOptions({ name: 'ThemeSelect' })

const props = defineProps({
  systemThemeColor: propTypes.string.def(''),
  headerThemeColor: propTypes.string.def(''),
  menuThemeColor: propTypes.string.def(''),
  layout:propTypes.string.def('')
})
const emit = defineEmits(['update:systemThemeColor','update:headerThemeColor','update:menuThemeColor'])

const systemTheme = ref(props.systemThemeColor)
watch(
  () => props.systemThemeColor,
  (val: string) => {
    if (val === unref(systemTheme)) return
    systemTheme.value = val
  }
)
// 监听
watch(
  () => systemTheme.value,
  (val: string) => {
    emit('update:systemThemeColor', val)
  }
)

const headerTheme = ref(props.headerThemeColor)
watch(
  () => props.headerThemeColor,
  (val: string) => {
    if (val === unref(headerTheme)) return
    headerTheme.value = val
  }
)
// 监听
watch(
  () => headerTheme.value,
  (val: string) => {
    emit('update:headerThemeColor', val)
  }
)

const menuTheme = ref(props.menuThemeColor)
watch(
  () => props.menuThemeColor,
  (val: string) => {
    if (val === unref(menuTheme)) return
    menuTheme.value = val
  }
)
// 监听
watch(
  () => menuTheme.value,
  (val: string) => {
    emit('update:menuThemeColor', val)
  }
)

const layout = computed(() => {
  if(props.layout === 'top'){
    setMenuThemeColor(null)
  }else{
    setMenuThemeColor('#001529')
  }
  return props.layout
})

const setSystemThemeColor = (value) => {
  systemTheme.value = value
  emit('update:systemThemeColor',value)
}
const setHeaderThemeColor = (value) => {
  headerTheme.value = value
  emit('update:headerThemeColor',value)
}
const setMenuThemeColor = (value) => {
  menuTheme.value = value
  emit('update:menuThemeColor',value)
}
const appStore = useAppStore()
// const { setWatermark } = useWatermark()
// 初始化获取是否是暗黑主题
const isDark = computed(() => appStore.getIsDark)
// const water = ref()
// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)
// 面包屑图标
const breadcrumbIcon = computed(() => appStore.getBreadcrumbIcon)
// 折叠图标
const hamburger = computed(() => appStore.getHamburger)
// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)
// 尺寸图标
const size = computed(() => appStore.getSize)
// 多语言图标
const locale = computed(() => appStore.getLocale)
// 消息图标
const message = computed(() => appStore.getMessage)
// 标签页
const tagsView = computed(() => appStore.getTagsView)
// logo
const logo = computed(() => appStore.getLogo)
// 标签页图标
const tagsViewIcon = computed(() => appStore.getTagsViewIcon)
// 菜单手风琴
const uniqueOpened = computed(() => appStore.getUniqueOpened)
// 固定头部
const fixedHeader = computed(() => appStore.getFixedHeader)
// 页脚
const footer = computed(() => appStore.getFooter)
// 灰色模式
const greyMode = computed(() => appStore.getGreyMode)
// 固定菜单
const fixedMenu = computed(() => appStore.getFixedMenu)
const themeChange = (val: boolean) => {
  appStore.setIsDark(val)
}
const setMenuTheme = (color: string) => {
  const primaryColor = useCssVar('--el-color-primary', document.documentElement)
  const isDarkColor = colorIsDark(color)
  const theme: Recordable = {
    // 左侧菜单边框颜色
    leftMenuBorderColor: isDarkColor ? 'inherit' : '#eee',
    // 左侧菜单背景颜色
    leftMenuBgColor: color,
    // 左侧菜单浅色背景颜色
    leftMenuBgLightColor: isDarkColor ? lighten(color!, 6) : color,
    // 左侧菜单选中背景颜色
    leftMenuBgActiveColor: isDarkColor ? 'var(--el-color-primary)' : hexToRGB(unref(primaryColor), 0.1),
    // 左侧菜单收起选中背景颜色
    leftMenuCollapseBgActiveColor: isDarkColor ? 'var(--el-color-primary)' : hexToRGB(unref(primaryColor), 0.1),
    // 左侧菜单字体颜色
    leftMenuTextColor: isDarkColor ? '#bfcbd9' : '#333',
    // 左侧菜单选中字体颜色
    leftMenuTextActiveColor: isDarkColor ? '#fff' : 'var(--el-color-primary)',
    // logo字体颜色
    logoTitleTextColor: isDarkColor ? '#fff' : 'inherit',
    // logo边框颜色
    logoBorderColor: isDarkColor ? color : '#eee'
  }
  appStore.setTheme(theme)
  appStore.setCssVarTheme()
}
const setSystemTheme = (color: string) => {
  setCssVar('--el-color-primary', color)
  appStore.setTheme({ elColorPrimary: color })
  const leftMenuBgColor = useCssVar('--left-menu-bg-color', document.documentElement)
  setMenuTheme(trim(unref(leftMenuBgColor)))
}
const setHeaderTheme = (color: string) => {
  const isDarkColor = colorIsDark(color)
  const textColor = isDarkColor ? '#fff' : 'inherit'
  const textHoverColor = isDarkColor ? lighten(color!, 6) : '#f6f6f6'
  const topToolBorderColor = isDarkColor ? color : '#eee'
  setCssVar('--top-header-bg-color', color)
  setCssVar('--top-header-text-color', textColor)
  setCssVar('--top-header-hover-color', textHoverColor)
  appStore.setTheme({
    topHeaderBgColor: color,
    topHeaderTextColor: textColor,
    topHeaderHoverColor: textHoverColor,
    topToolBorderColor
  })
  if (unref(layout) === 'top') {
    setMenuTheme(color)
  }
}
// if (layout.value === 'top' && !appStore.getIsDark) {
//   headerTheme.value = '#fff'
//   setHeaderTheme('#fff')
// }
const breadcrumbChange = (show: boolean) => {
  appStore.setBreadcrumb(show)
}
const breadcrumbIconChange = (show: boolean) => {
  appStore.setBreadcrumbIcon(show)
}

const hamburgerChange = (show: boolean) => {
  appStore.setHamburger(show)
}
const screenfullChange = (show: boolean) => {
  appStore.setScreenfull(show)
}
const sizeChange = (show: boolean) => {
  appStore.setSize(show)
}
const localeChange = (show: boolean) => {
  appStore.setLocale(show)
}

const messageChange = (show: boolean) => {
  appStore.setMessage(show)
}

const tagsViewChange = (show: boolean) => {
  // 切换标签栏显示时，同步切换标签栏的高度
  setCssVar('--tags-view-height', show ? '35px' : '0px')
  appStore.setTagsView(show)
}

const tagsViewIconChange = (show: boolean) => {
  appStore.setTagsViewIcon(show)
}
const logoChange = (show: boolean) => {
  appStore.setLogo(show)
}

const uniqueOpenedChange = (uniqueOpened: boolean) => {
  appStore.setUniqueOpened(uniqueOpened)
}

const fixedHeaderChange = (show: boolean) => {
  appStore.setFixedHeader(show)
}

const footerChange = (show: boolean) => {
  appStore.setFooter(show)
}

const greyModeChange = (show: boolean) => {
  appStore.setGreyMode(show)
}

const fixedMenuChange = (show: boolean) => {
  appStore.setFixedMenu(show)
}
const getCurrentValue = (value: string, type: string) => {
  switch (type) {
    case '1': {
      if (!value) value = '#409eff'
      setSystemThemeColor(value)
      break
    }
    case '2': {
      if (!value) value = '#fff'
      setHeaderThemeColor(value)
      break
    }
    case '3': {
      if (!value) value = '#001529'
      setMenuThemeColor(value)
      break
    }
  }
}
/*// 设置水印
const setWater = () => {
  setWatermark(water.value)
}*/
const copyConfig = async () => {
  const { copy, copied, isSupported } = useClipboard({
    source: `
      // 面包屑
      breadcrumb: ${appStore.getBreadcrumb},
      // 面包屑图标
      breadcrumbIcon: ${appStore.getBreadcrumbIcon},
      // 折叠图标
      hamburger: ${appStore.getHamburger},
      // 全屏图标
      screenfull: ${appStore.getScreenfull},
      // 尺寸图标
      size: ${appStore.getSize},
      // 多语言图标
      locale: ${appStore.getLocale},
      // 消息图标
      message: ${appStore.getMessage},
      // 标签页
      tagsView: ${appStore.getTagsView},
      // 标签页图标
      getTagsViewIcon: ${appStore.getTagsViewIcon},
      // logo
      logo: ${appStore.getLogo},
      // 菜单手风琴
      uniqueOpened: ${appStore.getUniqueOpened},
      // 固定header
      fixedHeader: ${appStore.getFixedHeader},
      // 页脚
      footer: ${appStore.getFooter},
      // 灰色模式
      greyMode: ${appStore.getGreyMode},
      // layout布局
      layout: '${appStore.getLayout}',
      // 暗黑模式
      isDark: ${appStore.getIsDark},
      // 组件尺寸
      currentSize: '${appStore.getCurrentSize}',
      // 主题相关
      theme: {
        // 主题色
        elColorPrimary: '${appStore.getTheme.elColorPrimary}',
        // 左侧菜单边框颜色
        leftMenuBorderColor: '${appStore.getTheme.leftMenuBorderColor}',
        // 左侧菜单背景颜色
        leftMenuBgColor: '${appStore.getTheme.leftMenuBgColor}',
        // 左侧菜单浅色背景颜色
        leftMenuBgLightColor: '${appStore.getTheme.leftMenuBgLightColor}',
        // 左侧菜单选中背景颜色
        leftMenuBgActiveColor: '${appStore.getTheme.leftMenuBgActiveColor}',
        // 左侧菜单收起选中背景颜色
        leftMenuCollapseBgActiveColor: '${appStore.getTheme.leftMenuCollapseBgActiveColor}',
        // 左侧菜单字体颜色
        leftMenuTextColor: '${appStore.getTheme.leftMenuTextColor}',
        // 左侧菜单选中字体颜色
        leftMenuTextActiveColor: '${appStore.getTheme.leftMenuTextActiveColor}',
        // logo字体颜色
        logoTitleTextColor: '${appStore.getTheme.logoTitleTextColor}',
        // logo边框颜色
        logoBorderColor: '${appStore.getTheme.logoBorderColor}',
        // 头部背景颜色
        topHeaderBgColor: '${appStore.getTheme.topHeaderBgColor}',
        // 头部字体颜色
        topHeaderTextColor: '${appStore.getTheme.topHeaderTextColor}',
        // 头部悬停颜色
        topHeaderHoverColor: '${appStore.getTheme.topHeaderHoverColor}',
        // 头部边框颜色
        topToolBorderColor: '${appStore.getTheme.topToolBorderColor}'
      }
    `
  })
  if (!isSupported) {
    ElMessage.error(t('setting.copyFailed'))
  } else {
    await copy()
    if (unref(copied)) {
      ElMessage.success(t('setting.copySuccess'))
    }
  }
}
// 清空缓存
const clear = () => {
  const { wsCache } = useCache()
  wsCache.delete(CACHE_KEY.LAYOUT)
  wsCache.delete(CACHE_KEY.THEME)
  wsCache.delete(CACHE_KEY.IS_DARK)
  window.location.reload()
}
// watch(
//   () => layout,
//   (n) => {
//     if (n === 'top') {
//       // appStore.setCollapse(false)
//       // if (!appStore.getIsDark) {
//       //   headerTheme.value = '#fff'
//       //   setHeaderTheme('#fff')
//       // } else {
//       //   setMenuTheme(unref(menuTheme))
//       // }
//     }
//   }
// )
</script>

<style lang="scss" scoped>
:deep(.el-switch__core .el-switch__inner .is-icon) {
  overflow: visible;
}
.theme-content {
  .two {
  }
  .box {
    .box-title {
      text-align: left;
      height: 32px;
      line-height: 32px;
      margin-bottom: 5px;
    }
  }
  .five {
    margin-left: -10px;
  }
  .align-center {
    align-items: center;
  }
}
</style>
