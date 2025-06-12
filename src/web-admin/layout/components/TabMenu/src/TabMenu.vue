<script lang="tsx">
import { usePermissionStore } from '@/web-admin/store/modules/permission'
import { useAppStore } from '@/store/modules/app'

import { ElScrollbar, ElPopover } from 'element-plus'
import { Icon } from '@/components/Icon'
import { Menu } from '@/web-admin/layout/components/Menu'
import { pathResolve } from '@/web-admin/utils/routerHelper'
import { cloneDeep } from 'lodash-es'
import { filterMenusPath, initTabMap, tabPathMap } from './helper'
import { useDesign } from '@/hooks/web/useDesign'
import { isUrl } from '@/utils/is'
import {pxToVw} from '@/utils'
import { defineEmits } from 'vue'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tab-menu')

export default defineComponent({
  name: 'TabMenu',
  setup(props, setupContext) {
    const { push, currentRoute } = useRouter()

    const { emit } = setupContext

    const { t } = useI18n()

    const appStore = useAppStore()

    const collapse = computed(() => appStore.getCollapse)

    const fixedMenu = computed(() => appStore.getFixedMenu)

    const permissionStore = usePermissionStore()

    const routers = computed(() => permissionStore.getRouters)

    const tabRouters = computed(() => unref(routers).filter((v) => !v?.meta?.hidden))

    const setCollapse = () => {
      appStore.setCollapse(!unref(collapse))
    }

    onMounted(() => {
      if (unref(fixedMenu)) {
        const path = `/${unref(currentRoute).path.split('/')[1]}`
        const children = unref(tabRouters).find(
          (v) => (v.meta?.alwaysShow || (v?.children?.length && v?.children?.length > 1)) && v.path === path
        )?.children

        tabActive.value = path
        if (children) {
          permissionStore.setMenuTabRouters(
            cloneDeep(children).map((v) => {
              v.path = pathResolve(unref(tabActive), v.path)
              return v
            })
          )
        }
      }
    })

    watch(
      () => routers.value,
      (routers: AppRouteRecordRaw[]) => {
        initTabMap(routers)
        filterMenusPath(routers, routers)
      },
      {
        immediate: true,
        deep: true
      }
    )

    const showTitle = ref(true)

    watch(
      () => collapse.value,
      (collapse: boolean) => {
        if (!collapse) {
          setTimeout(() => {
            showTitle.value = !collapse
          }, 200)
        } else {
          showTitle.value = !collapse
        }
      }
    )

    // 是否显示菜单
    const showMenu = ref(unref(fixedMenu) ? true : false)

    // tab高亮
    const tabActive = ref('')

    // tab点击事件
    const tabClick = (item: AppRouteRecordRaw, parentItem?: AppRouteRecordRaw) => {
      if (isUrl(item.path)) {
        window.open(item.path)
        return
      }
      let newPath = item.path
      if (parentItem) {
        newPath = parentItem.path + '/' + item.path
      }
      if (newPath.includes('develop/funMng')) {
        emit('showModuleMenu', true)
      } else {
        emit('showModuleMenu', false)
        push(newPath)
      }
    }

    // 设置高亮
    const isActive = (currentPath: string) => {
      const { path } = unref(currentRoute)
      if (tabPathMap[currentPath].includes(path)) {
        return true
      }
      return false
    }

    const mouseleave = () => {
      if (!unref(showMenu) || unref(fixedMenu)) return
      showMenu.value = false
    }
    const showArrow = false
    const offset = -0.5

    return () => (
      <div id={`v-tab-menu`} class="v-tab-menu" onMouseleave={mouseleave}>
        <ElScrollbar class="!h-[calc(100%-var(--tab-menu-collapse-height)-1px)]">
          <div>
            {() => {
              return unref(tabRouters).map((v, vIndex) => {
                const item = (
                  v.meta?.alwaysShow || (v?.children?.length && v?.children?.length > 1)
                    ? v
                    : {
                        ...(v?.children && v?.children[0]),
                        path: pathResolve(v.path, (v?.children && v?.children[0])?.path as string)
                      }
                ) as AppRouteRecordRaw
                return (
                  <div class="tab-menu-content text-center text-12px cursor-pointer">
                    {item.children?.length >= 1 ? (
                      <div>
                        <div class="menu-item py-12px">
                          <div>
                            <Icon icon={item?.meta?.icon} class="menu-icon"></Icon>
                          </div>
                          {!unref(showTitle) ? undefined : (
                            <p class="mt-5px break-words px-2px menu-name">{t(item.meta?.title)}</p>
                          )}
                        </div>

                        <div class="menu-list" style={[{ top: pxToVw(vIndex * 85 + 60) + 'vw' }]}>
                          <ul>
                            {item.children
                              ?.filter((v) => !v?.meta?.hidden)
                              .map((childItem) => {
                                return (
                                  <li
                                    onClick={() => {
                                      tabClick(childItem, item)
                                    }}
                                  >
                                    {childItem.meta.title}
                                  </li>
                                )
                              })}
                          </ul>
                          <div class="menu-arrow"></div>
                        </div>
                      </div>
                    ) : (
                      <div
                        class="menu-item py-12px"
                        onClick={() => {
                          tabClick(item)
                        }}
                      >
                        <div>
                          <Icon icon={item?.meta?.icon} class="menu-icon"></Icon>
                        </div>
                        {!unref(showTitle) ? undefined : <p class="mt-5px break-words px-2px">{t(item.meta?.title)}</p>}
                      </div>
                    )}
                  </div>
                )
              })
            }}
          </div>
        </ElScrollbar>
      </div>
    )
  }
})
</script>

<style lang="scss" scoped>
.v-tab-menu {
  transition: all var(--transition-time-02);
  width: 100%;

  &__item {
    color: #fff;
    transition: all var(--transition-time-02);

    &:hover {
      color: var(--left-menu-text-active-color);
      background-color: var(--left-menu-bg-active-color);
    }
  }

  &--collapse {
    color: var(--left-menu-text-color);
    background-color: var(--left-menu-bg-light-color);
  }

  .is-active {
    color: var(--left-menu-text-active-color);
    background-color: var(--left-menu-bg-active-color);
  }

  .tab-menu-content {
    color: #fff;
    .menu-name{
      font-size: 14px;
    }
    .menu-list {
      opacity: 0;
      visibility: hidden;
      position: absolute;
      z-index: 999;
      left: 86px;
      width: 130px;
      background: #fff;

      border-radius: 4px;
      border: 1px solid #eee;
      background: #fff;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
      transition:
        opacity 0.5s ease,
        visibility 0.5s ease;
      ul {
        list-style: none;
        padding: 0;
        li {
          padding: 6px 0 6px 20px;
          color: #333;
          margin: 2px 0px;
          cursor: pointer;
          font-size: 14px;
          text-align:left;
          &:hover {
            color: var(--left-menu-text-active-color);
            background-color: var(--left-menu-bg-active-color);
          }
        }
      }
      .menu-arrow{
        position: absolute;
        width: 10px;
        height: 10px;
        -webkit-clip-path: polygon(100% 0%, 0% 100%, 0% 0%);
        clip-path: polygon(100% 0%, 0% 100%, 0% 0%);
        transform: rotate(-45deg);
        border: 1px solid #eee;
        background: rgba(255, 255, 255, 0.85);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        top: 30px;
        left: -5px;
      }
    }
  }
  .tab-menu-content:hover {
    .menu-item {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }
    .menu-list {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }
  }
  .tab-menu-content:not(:hover) .menu-list {
    opacity: 0;
    visibility: hidden;
    transition-delay: 0ms; /* 延迟隐藏 */
  }
}
:deep(.menu-icon) {
  font-size: 26px !important;
}
:deep(.el-scrollbar) {
  position: unset;
}
</style>
