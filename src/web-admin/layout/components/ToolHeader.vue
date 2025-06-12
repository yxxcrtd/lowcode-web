<script lang="tsx">
import { defineComponent, computed } from 'vue'
import { Message } from '@/web-admin/layout/components//Message'
import { Collapse } from '@/web-admin/layout/components/Collapse'
import { UserInfo } from '@/web-admin/layout/components/UserInfo'
import { Screenfull } from '@/web-admin/layout/components/Screenfull'
import { Breadcrumb } from '@/web-admin/layout/components/Breadcrumb'
import { SizeDropdown } from '@/web-admin/layout/components/SizeDropdown'
import { LocaleDropdown } from '@/web-admin/layout/components/LocaleDropdown'
import RouterSearch from '@/components/RouterSearch/index.vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tool-header')

const appStore = useAppStore()

// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)

// 折叠图标
const hamburger = computed(() => appStore.getHamburger)

// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)

// 消息图标
const message = computed(() => appStore.getMessage)

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    return () => (
      <div
        id={`v-tool-header-tool-header`}
        class={[
          'v-tool-header'
        ]}
      >
        <div class="h-full flex items-center">
          {screenfull.value ? (
            <Screenfull class="custom-hover" color="var(--top-header-text-color)"></Screenfull>
          ) : undefined}
          {message.value ? (
            <Message class="custom-hover" color="var(--top-header-text-color)"></Message>
          ) : undefined}
          <UserInfo></UserInfo>
        </div>
      </div>
    )
  }
})
</script>

<style lang="scss" scoped>
.v-tool-header{
  width: 240px;
  transition: left var(--transition-time-02);
}
</style>
