<script lang="ts" setup>
import { onMounted, watch, computed, unref, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouterLinkProps } from 'vue-router'
import { usePermissionStore } from '@/web-sys-external/store/modules/permission'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'
import { useI18n } from '@/hooks/web/useI18n'
import { filterAffixTags } from './helper'
import { ContextMenu, ContextMenuExpose } from '@/web-sys-external/layout/components/ContextMenu'
import { useDesign } from '@/hooks/web/useDesign'
import { useTemplateRefsList } from '@vueuse/core'
import { ElScrollbar } from 'element-plus'
import { useScrollTo } from '@/hooks/event/useScrollTo'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('tags-view')

const { t } = useI18n()

const { currentRoute, push, replace } = useRouter()

const permissionStore = usePermissionStore()

const routers = computed(() => permissionStore.getRouters)

const tagsViewStore = useTagsViewStore()

const visitedViews = computed(() => tagsViewStore.getVisitedViews)

const affixTagArr = ref<RouteLocationNormalizedLoaded[]>([])

const appStore = useAppStore()

const tagsViewIcon = computed(() => appStore.getTagsViewIcon)

const isDark = computed(() => appStore.getIsDark)

// 初始化tag
const initTags = () => {
  affixTagArr.value = filterAffixTags(unref(routers))
  for (const tag of unref(affixTagArr)) {
    // Must have tag name
    if (tag.name) {
      tagsViewStore.addVisitedView(tag)
    }
  }
}

const selectedTag = ref<RouteLocationNormalizedLoaded>()

// 新增tag
const addTags = () => {
  const { name } = unref(currentRoute)
  if (name) {
    selectedTag.value = unref(currentRoute)
    tagsViewStore.addView(unref(currentRoute))
  }
  return false
}

// 关闭选中的tag
const closeSelectedTag = (view: RouteLocationNormalizedLoaded) => {
  if (view?.meta?.affix) return
  tagsViewStore.delView(view)
  if (isActive(view)) {
    toLastView()
  }
}

// 关闭全部
const closeAllTags = () => {
  tagsViewStore.delAllViews()
  toLastView()
}

// 关闭其它
const closeOthersTags = () => {
  tagsViewStore.delOthersViews(unref(selectedTag) as RouteLocationNormalizedLoaded)
}

// 重新加载
const refreshSelectedTag = async (view?: RouteLocationNormalizedLoaded) => {
  if (!view) return
  tagsViewStore.delCachedView()
  const { path, query } = view
  await nextTick()
  replace({
    path: '/redirect' + path,
    query: query
  })
}

// 关闭左侧
const closeLeftTags = () => {
  tagsViewStore.delLeftViews(unref(selectedTag) as RouteLocationNormalizedLoaded)
}

// 关闭右侧
const closeRightTags = () => {
  tagsViewStore.delRightViews(unref(selectedTag) as RouteLocationNormalizedLoaded)
}

// 跳转到最后一个
const toLastView = () => {
  const visitedViews = tagsViewStore.getVisitedViews
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    push(latestView)
  } else {
    if (
      unref(currentRoute).path === permissionStore.getAddRouters[0].path ||
      unref(currentRoute).path === permissionStore.getAddRouters[0].redirect
    ) {
      addTags()
      return
    }
    // TODO: You can set another route
    push('/')
  }
}

// 滚动到选中的tag
const moveToCurrentTag = async () => {
  await nextTick()
  for (const v of unref(visitedViews)) {
    if (v.fullPath === unref(currentRoute).path) {
      moveToTarget(v)
      if (v.fullPath !== unref(currentRoute).fullPath) {
        tagsViewStore.updateVisitedView(unref(currentRoute))
      }

      break
    }
  }
}

const tagLinksRefs = useTemplateRefsList<RouterLinkProps>()

const moveToTarget = (currentTag: RouteLocationNormalizedLoaded) => {
  const wrap$ = unref(scrollbarRef)?.wrapRef
  let firstTag: Nullable<RouterLinkProps> = null
  let lastTag: Nullable<RouterLinkProps> = null

  const tagList = unref(tagLinksRefs)
  // find first tag and last tag
  if (tagList.length > 0) {
    firstTag = tagList[0]
    lastTag = tagList[tagList.length - 1]
  }
  if ((firstTag?.to as RouteLocationNormalizedLoaded).fullPath === currentTag.fullPath) {
    // 直接滚动到0的位置
    const { start } = useScrollTo({
      el: wrap$!,
      position: 'scrollLeft',
      to: 0,
      duration: 500
    })
    start()
  } else if ((lastTag?.to as RouteLocationNormalizedLoaded).fullPath === currentTag.fullPath) {
    // 滚动到最后的位置
    const { start } = useScrollTo({
      el: wrap$!,
      position: 'scrollLeft',
      to: wrap$!.scrollWidth - wrap$!.offsetWidth,
      duration: 500
    })
    start()
  } else {
    // find preTag and nextTag
    const currentIndex: number = tagList.findIndex(
      (item) => (item?.to as RouteLocationNormalizedLoaded).fullPath === currentTag.fullPath
    )
    const tgsRefs = document.getElementsByClassName(`${prefixCls}__item`)

    const prevTag = tgsRefs[currentIndex - 1] as HTMLElement
    const nextTag = tgsRefs[currentIndex + 1] as HTMLElement

    // the tag's offsetLeft after of nextTag
    const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + 4

    // the tag's offsetLeft before of prevTag
    const beforePrevTagOffsetLeft = prevTag.offsetLeft - 4

    if (afterNextTagOffsetLeft > unref(scrollLeftNumber) + wrap$!.offsetWidth) {
      const { start } = useScrollTo({
        el: wrap$!,
        position: 'scrollLeft',
        to: afterNextTagOffsetLeft - wrap$!.offsetWidth,
        duration: 500
      })
      start()
    } else if (beforePrevTagOffsetLeft < unref(scrollLeftNumber)) {
      const { start } = useScrollTo({
        el: wrap$!,
        position: 'scrollLeft',
        to: beforePrevTagOffsetLeft,
        duration: 500
      })
      start()
    }
  }
}

// 是否是当前tag
const isActive = (route: RouteLocationNormalizedLoaded): boolean => {
  return route.path === unref(currentRoute).path
}

// 所有右键菜单组件的元素
const itemRefs = useTemplateRefsList<ComponentRef<typeof ContextMenu & ContextMenuExpose>>()

// 右键菜单装填改变的时候
const visibleChange = (visible: boolean, tagItem: RouteLocationNormalizedLoaded) => {
  if (visible) {
    for (const v of unref(itemRefs)) {
      const elDropdownMenuRef = v.elDropdownMenuRef
      if (tagItem.fullPath !== v.tagItem.fullPath) {
        elDropdownMenuRef?.handleClose()
      }
    }
  }
}

// elscroll 实例
const scrollbarRef = ref<ComponentRef<typeof ElScrollbar>>()

// 保存滚动位置
const scrollLeftNumber = ref(0)

const scroll = ({ scrollLeft }) => {
  scrollLeftNumber.value = scrollLeft as number
}

// 移动到某个位置
const move = (to: number) => {
  const wrap$ = unref(scrollbarRef)?.wrapRef
  const { start } = useScrollTo({
    el: wrap$!,
    position: 'scrollLeft',
    to: unref(scrollLeftNumber) + to,
    duration: 500
  })
  start()
}
//获取指定区域的宽度，当区域超过指定后显示左右箭头
const showArrow = ref(false)
const getWidth = () => {
  setTimeout(async () => {
    await nextTick()
    const $wrap = unref(scrollbarRef)?.wrapRef
    const itemList = $wrap?.querySelectorAll('.v-tags-view__item')
    let widths = 0
    if (itemList) {
      itemList.forEach((v) => {
        widths += v.clientWidth || 0
      })
    }
    showArrow.value = $wrap ? widths >= $wrap.clientWidth : false
  }, 0)
}

onMounted(() => {
  initTags()
  addTags()
  getWidth()
})

watch(
  () => currentRoute.value,
  () => {
    addTags()
    moveToCurrentTag()
    getWidth()
  }
)
</script>

<template>
  <div :id="prefixCls" :class="prefixCls" class="relative w-full flex bg-[#fff] dark:bg-[var(--el-bg-color)]">
    <span
      v-show="showArrow"
      :class="`${prefixCls}__tool ${prefixCls}__tool--first`"
      class="h-[var(--tags-view-height)] w-[var(--tags-view-height)] flex cursor-pointer items-center justify-center"
      @click="move(-200)"
    >
      <Icon
        icon="ep:d-arrow-left"
        color="var(--el-text-color-placeholder)"
        :hover-color="isDark ? '#fff' : 'var(--el-color-black)'"
      />
    </span>
    <div class="flex-1 overflow-hidden">
      <ElScrollbar ref="scrollbarRef" class="h-full" @scroll="scroll">
        <div class="h-full flex">
          <ContextMenu
            :ref="itemRefs.set"
            :schema="[
              {
                icon: 'ep:refresh',
                label: t('common.reload'),
                disabled: selectedTag?.fullPath !== item.fullPath,
                command: () => {
                  refreshSelectedTag(item)
                }
              },
              {
                icon: 'ep:close',
                label: t('common.closeTab'),
                disabled: !!visitedViews?.length && selectedTag?.meta.affix,
                command: () => {
                  closeSelectedTag(item)
                }
              },
              {
                divided: true,
                icon: 'ep:d-arrow-left',
                label: t('common.closeTheLeftTab'),
                disabled:
                  !!visitedViews?.length &&
                  (item.fullPath === visitedViews[0].fullPath || selectedTag?.fullPath !== item.fullPath),
                command: () => {
                  closeLeftTags()
                }
              },
              {
                icon: 'ep:d-arrow-right',
                label: t('common.closeTheRightTab'),
                disabled:
                  !!visitedViews?.length &&
                  (item.fullPath === visitedViews[visitedViews.length - 1].fullPath ||
                    selectedTag?.fullPath !== item.fullPath),
                command: () => {
                  closeRightTags()
                }
              },
              {
                divided: true,
                icon: 'ep:discount',
                label: t('common.closeOther'),
                disabled: selectedTag?.fullPath !== item.fullPath,
                command: () => {
                  closeOthersTags()
                }
              },
              {
                icon: 'ep:minus',
                label: t('common.closeAll'),
                command: () => {
                  closeAllTags()
                }
              }
            ]"
            v-for="item in visitedViews"
            :key="item.fullPath"
            :tag-item="item"
            :class="[
              `${prefixCls}__item`,
              item?.meta?.affix ? `${prefixCls}__item--affix` : '',
              {
                'is-active': isActive(item)
              }
            ]"
            @visible-change="visibleChange"
          >
            <div>
              <router-link :ref="tagLinksRefs.set" :to="{ ...item }" custom v-slot="{ navigate }">
                <div @click="navigate" class="h-full flex items-center justify-center whitespace-nowrap pl-15px">
                  <Icon
                    v-if="item?.matched && item?.matched[1] && item?.matched[1]?.meta?.icon && item?.meta?.icon!='#' && tagsViewIcon"
                    :icon="item?.matched[1]?.meta?.icon"
                    :size="12"
                    class="mr-5px"
                  />
                  {{ t(item?.meta?.title as string) }}
                  <Icon
                    :class="`${prefixCls}__item--close`"
                    v-if="!item?.meta?.affix"
                    color="#333"
                    icon="ep:close"
                    :size="12"
                    @click.prevent.stop="closeSelectedTag(item)"
                  />
                </div>
              </router-link>
            </div>
          </ContextMenu>
        </div>
      </ElScrollbar>
    </div>
    <span
      v-show="showArrow"
      :class="`${prefixCls}__tool`"
      class="h-[var(--tags-view-height)] w-[var(--tags-view-height)] flex cursor-pointer items-center justify-center"
      @click="move(200)"
    >
      <Icon
        icon="ep:d-arrow-right"
        color="var(--el-text-color-placeholder)"
        :hover-color="isDark ? '#fff' : 'var(--el-color-black)'"
      />
    </span>
    <!--    <span
      :class="`${prefixCls}__tool`"
      class="h-[var(&#45;&#45;tags-view-height)] w-[var(&#45;&#45;tags-view-height)] flex cursor-pointer items-center justify-center"
      @click="refreshSelectedTag(selectedTag)"
    >
      <Icon
        icon="ep:refresh-right"
        color="var(&#45;&#45;el-text-color-placeholder)"
        :hover-color="isDark ? '#fff' : 'var(&#45;&#45;el-color-black)'"
      />
    </span>-->
    <ContextMenu
      trigger="click"
      :schema="[
        {
          icon: 'ep:refresh',
          label: t('common.reload'),
          command: () => {
            refreshSelectedTag(selectedTag)
          }
        },
        {
          icon: 'ep:close',
          label: t('common.closeTab'),
          disabled: !!visitedViews?.length && selectedTag?.meta.affix,
          command: () => {
            closeSelectedTag(selectedTag!)
          }
        },
        {
          divided: true,
          icon: 'ep:d-arrow-left',
          label: t('common.closeTheLeftTab'),
          disabled: !!visitedViews?.length && selectedTag?.fullPath === visitedViews[0].fullPath,
          command: () => {
            closeLeftTags()
          }
        },
        {
          icon: 'ep:d-arrow-right',
          label: t('common.closeTheRightTab'),
          disabled: !!visitedViews?.length && selectedTag?.fullPath === visitedViews[visitedViews.length - 1].fullPath,
          command: () => {
            closeRightTags()
          }
        },
        {
          divided: true,
          icon: 'ep:discount',
          label: t('common.closeOther'),
          command: () => {
            closeOthersTags()
          }
        },
        {
          icon: 'ep:minus',
          label: t('common.closeAll'),
          command: () => {
            closeAllTags()
          }
        }
      ]"
    >
      <span
        :class="`${prefixCls}__tool`"
        class="block h-[var(--tags-view-height)] w-[var(--tags-view-height)] flex cursor-pointer items-center justify-center"
      >
        <Icon
          icon="ep:menu"
          color="var(--el-text-color-placeholder)"
          :hover-color="isDark ? '#fff' : 'var(--el-color-black)'"
        />
      </span>
    </ContextMenu>
  </div>
</template>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-tags-view;

.#{$prefix-cls} {
  :deep(.#{$elNamespace}-scrollbar__view) {
    height: 100%;
  }

  &__tool {
    position: relative;

    &::before {
      position: absolute;
      top: 1px;
      left: 0;
      width: 100%;
      height: calc(100% - 1px);
      border-left: 1px solid var(--el-border-color);
      content: '';
    }

    &--first {
      &::before {
        position: absolute;
        top: 1px;
        left: 0;
        width: 100%;
        height: calc(100% - 1px);
        border-right: 1px solid var(--el-border-color);
        border-left: none;
        content: '';
      }
    }
  }

  &__item {
    position: relative;
    //top: 5px;
    height: 36px;
    line-height: 36px;
    padding-right: 25px;
    margin-left: 4px;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    //width: 80px;
    //border: 1px solid #d9d9d9;
    border-radius: 4px 4px 0 0;
    -webkit-mask: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANoAAAAkBAMAAAAdqzmBAAAAMFBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlTPQ5AAAAD3RSTlMAr3DvEM8wgCBA379gj5//tJBPAAAAnUlEQVRIx2NgAAM27fj/tAO/xBsYkIHyf9qCT8iWMf6nNQhAsk2f5rYheY7Dnua2/U+A28ZEe8v+F9Ax2v7/F4DbxkUH2wzgtvHTwbYPo7aN2jZq26hto7aN2jZq25Cy7Qvctnw62PYNbls9HWz7S8/G6//PsI6H4396gAUQy1je08W2jxDbpv6nD4gB2uWp+J9eYPsEhv/0BPS1DQBvoBLVZ3BppgAAAABJRU5ErkJggg==);
    mask: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANoAAAAkBAMAAAAdqzmBAAAAMFBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlTPQ5AAAAD3RSTlMAr3DvEM8wgCBA379gj5//tJBPAAAAnUlEQVRIx2NgAAM27fj/tAO/xBsYkIHyf9qCT8iWMf6nNQhAsk2f5rYheY7Dnua2/U+A28ZEe8v+F9Ax2v7/F4DbxkUH2wzgtvHTwbYPo7aN2jZq26hto7aN2jZq25Cy7Qvctnw62PYNbls9HWz7S8/G6//PsI6H4396gAUQy1je08W2jxDbpv6nD4gB2uWp+J9eYPsEhv/0BPS1DQBvoBLVZ3BppgAAAABJRU5ErkJggg==);
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;

    &--close {
      position: absolute;
      top: 50%;
      right: 10px;
      display: none;
      transform: translate(0, -50%);
    }
    &:not(.#{$prefix-cls}__item--affix):hover {
      background-color: #f5f5f5;
      .#{$prefix-cls}__item--close {
        display: block;
        :deep(span) {
          color: var(--el-color-primary) !important;
        }
        //color: var(--el-color-primary)!important;
      }
    }
  }

  &__item:not(.is-active) {
    &:hover {
      color: var(--el-color-primary);
    }
  }

  &__item.is-active {
    color: var(--el-color-primary);
    //background-color: var(--el-color-primary);
    //border: 1px solid var(--el-color-primary);
    background-color: #f5f5f5;
    .#{$prefix-cls}__item--close {
      display: block;
      :deep(span) {
        color: var(--el-color-primary) !important;
      }
    }
  }
}

.dark {
  .#{$prefix-cls} {
    &__tool {
      &--first {
        &::after {
          display: none;
        }
      }
    }

    &__item {
      border: 1px solid var(--el-border-color);
    }

    &__item:not(.is-active) {
      &:hover {
        color: var(--el-color-primary);
      }
    }

    &__item.is-active {
      color: var(--el-color-white);
      background-color: var(--el-color-primary);
      border: 1px solid var(--el-color-primary);
      .#{$prefix-cls}__item--close {
        :deep(span) {
          color: var(--el-color-white) !important;
        }
      }
    }
  }
}
</style>
