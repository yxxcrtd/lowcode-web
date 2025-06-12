<script lang="tsx">
import { defineComponent, computed } from 'vue'
import { Message } from '@/web-sys-external/layout/components//Message'
import { Collapse } from '@/web-sys-external/layout/components/Collapse'
import { UserInfo } from '@/web-sys-external/layout/components/UserInfo'
import { Screenfull } from '@/web-sys-external/layout/components/Screenfull'
import { Breadcrumb } from '@/web-sys-external/layout/components/Breadcrumb'
import { SizeDropdown } from '@/web-sys-external/layout/components/SizeDropdown'
import { LocaleDropdown } from '@/web-sys-external/layout/components/LocaleDropdown'
import RouterSearch from '@/components/RouterSearch/index.vue'
import { TagsView } from '@/web-sys-external/layout/components/TagsView'
import {Platform} from '@element-plus/icons-vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tool-header')

const appStore = useAppStore()

const tagsView = computed(() => appStore.getTagsView)

// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)

// 折叠图标
const hamburger = computed(() => appStore.getHamburger)

// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)

// 搜索图片
const search = computed(() => appStore.search)

// 尺寸图标
const size = computed(() => appStore.getSize)

// 布局
const layout = computed(() => appStore.getLayout)

// 多语言图标
const locale = computed(() => appStore.getLocale)

// 消息图标
const message = computed(() => appStore.getMessage)

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    const jumpAdmin = ()=>{
      window.open('/admin')
    }
    return () => (
      <div
        id={`${variables.namespace}-tool-header`}
        class={[
          prefixCls,
          'relative px-[var(--top-tool-p-x)] flex items-center justify-between',
          'dark:bg-[var(--el-bg-color)]'
        ]}
      >
        {/*layout.value !== 'top' ? (
          <div class="h-full flex items-center">
            {hamburger.value && layout.value !== 'cutMenu' ? (
              <Collapse class="custom-hover" color="var(--top-header-text-color)"></Collapse>
            ) : undefined}
            {breadcrumb.value ? <Breadcrumb class="lt-md:hidden"></Breadcrumb> : undefined}
          </div>
        ) : undefined*/}
        {tagsView.value ? (
                <TagsView class="layout-border__top layout-border__bottom tag-view"></TagsView>
              ) : undefined}
        <div class="h-full flex items-center">
          <el-tooltip
            placement="top-end"
            title=""
            width={200}
            trigger="hover"
            content="跳转到管控台"
          >
              <div class="admin-btn" onClick={() => jumpAdmin()}>
                <el-icon size={18}><Platform/></el-icon>
              </div>
          </el-tooltip>
          <UserInfo></UserInfo>
        </div>
      </div>
    )
  }
})
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-tool-header;

.#{$prefix-cls} {
  height:42px;
  border-bottom: 1px solid #dcdfe6;
  transition: left var(--transition-time-02);
}
.admin-btn{
  display: flex;
  align-items: center;
  cursor: pointer;
}
.tag-view{
  flex: 1;
  margin: 7px 10px 0 0;
}
.layout-border__top::before{
  content: '';
  background-color: transparent;
}
</style>
