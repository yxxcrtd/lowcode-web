<template>
  <div>
    <el-skeleton :loading="loading" animated>
        <el-row :gutter="16" justify="space-between">
          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <div class="flex top-div" >
              <div style="display: flex;flex-direction: column;justify-content: space-between;">
                <div class="text-20px font-bold" style="font-style: italic;">
                  下午好 {{ username }} 
                </div>
                <div  class="flex items-center">
                  <div class="top-div-item">
                    <img width="50px" alt="" />
                    <span style="font-size: 12px;color: #999;">未读消息</span>
                    <div class="flex items-center" style="height: 30px;justify-content: space-between;width: 100%;">
                      <span style="font-size: 18px;color: #333;font-weight: bold;line-height: 20px;">2974</span>
                      <Icon icon="ep:arrow-right" :size="14" style="line-height: 20px;color: #999;" />
                    </div>
                  </div>
                  <div class="top-div-item">
                    <img width="50px" alt="" />
                    <span style="font-size: 12px;color: #999;">流程待办</span>
                    <div class="flex items-center" style="height: 30px;justify-content: space-between;width: 100%;">
                      <span style="font-size: 18px;color: #333;font-weight: bold;line-height: 20px;">{{ totalSate.todo }}</span>
                      <Icon icon="ep:arrow-right" :size="14" style="line-height: 20px;color: #999;" />
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </el-col>
          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <el-card shadow="never">
              <template #header>
                <div class="h-3 flex justify-between">
                  <span>快捷菜单</span>
                </div>
              </template>
                <el-row>
                  <el-skeleton :loading="loading" animated>
                  <el-col v-for="item in shortcutMenu" :key="`team-${item.name}`" :span="6" class="mb-18px">
                    <div class="flex items-center" style="flex-direction: column;">
                      <Icon :icon="item.icon" :size="31" />
                      <el-link type="default" :underline="false" @click="setWatermark(item.name)">
                        {{ item.name }}
                      </el-link>
                    </div>
                  </el-col>
                </el-skeleton>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
      </el-skeleton>
      <el-skeleton :loading="loading" animated>
        <el-row :gutter="16" justify="space-between" class="mt-20px">
          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <el-card shadow="never">
              <template #header>
                <div class="h-3 flex justify-between">
                  <span>图表1</span>
                </div>
              </template>
                <el-skeleton :loading="loading" animated>
                  <Echart :options="barOptionsData" :height="280" />
                </el-skeleton>
            </el-card>
          </el-col>
          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <el-card shadow="never">
              <template #header>
                <div class="h-3 flex justify-between">
                  <span>图表2</span>
                </div>
              </template>
                <el-skeleton :loading="loading" animated>
                  <Echart :options="lineOptionsData" :height="280" />
                </el-skeleton>
            </el-card>
          </el-col>
        </el-row>
      </el-skeleton>
  </div>

</template>
<script lang="ts" setup>
import { set } from 'lodash-es'
import { EChartsOption } from 'echarts'
import { formatTime } from '@/utils'

import { useUserStore } from '@/store/modules/user'
import { useWatermark } from '@/hooks/web/useWatermark'
import type { WorkplaceTotal, Project, Notice, Shortcut } from './types'
import { pieOptions, barOptions, lineOptions } from './echarts-data'
import AceSelectTable from "@/components/ace/ace-select-table/index.vue";

defineOptions({ name: 'Home' })

const { t } = useI18n()
const userStore = useUserStore()
const { setWatermark } = useWatermark()
const loading = ref(true)
const avatar = userStore.getUser.avatar
const username = userStore.getUser.nickname
const pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption
// 获取统计数
let totalSate = reactive<WorkplaceTotal>({
  project: 0,
  access: 0,
  todo: 0
})
let amt=ref([1,2])
let lll=ref(['董事长','项目经理'])
let amt1=ref('1')
let lll1=ref('董事长')
const columnsTestTable =reactive([
  {
    title: '岗位名称',
    align: 'center',
    dataIndex: 'name',
    field: 'name',

  },
  {
    title: '岗位编码',
    align: 'center',
    dataIndex: 'code',
    field: 'code',
  },
])



const getCount = async () => {
  const data = {
    project: 40,
    access: 2340,
    todo: 10
  }
  totalSate = Object.assign(totalSate, data)
}

// 获取项目数
let projects = reactive<Project[]>([])
const getProject = async () => {
  const data = [
    {
      name: 'ruoyi-vue-pro',
      icon: 'akar-icons:github-fill',
      message: 'https://github.com/YunaiV/ruoyi-vue-pro',
      personal: 'Spring Boot 单体架构',
      time: new Date()
    },
    {
      name: 'yudao-ui-admin-vue3',
      icon: 'logos:vue',
      message: 'https://github.com/yudaocode/yudao-ui-admin-vue3',
      personal: 'Vue3 + element-plus',
      time: new Date()
    },
    {
      name: 'yudao-ui-admin-vben',
      icon: 'logos:vue',
      message: 'https://github.com/yudaocode/yudao-ui-admin-vben',
      personal: 'Vue3 + vben(antd)',
      time: new Date()
    },
    {
      name: 'yudao-cloud',
      icon: 'akar-icons:github',
      message: 'https://github.com/YunaiV/yudao-cloud',
      personal: 'Spring Cloud 微服务架构',
      time: new Date()
    },
    {
      name: 'yudao-ui-mall-uniapp',
      icon: 'logos:vue',
      message: 'https://github.com/yudaocode/yudao-ui-admin-uniapp',
      personal: 'Vue3 + uniapp',
      time: new Date()
    },
    {
      name: 'yudao-ui-admin-vue2',
      icon: 'logos:vue',
      message: 'https://github.com/yudaocode/yudao-ui-admin-vue2',
      personal: 'Vue2 + element-ui',
      time: new Date()
    }
  ]
  projects = Object.assign(projects, data)
}

// 获取通知公告
let notice = reactive<Notice[]>([])
const getNotice = async () => {
  const data = [
    {
      title: '系统支持 JDK 8/17/21，Vue 2/3',
      type: '通知',
      keys: ['通知', '8', '17', '21', '2', '3'],
      date: new Date()
    },
    {
      title: '后端提供 Spring Boot 2.7/3.2 + Cloud 双架构',
      type: '公告',
      keys: ['公告', 'Boot', 'Cloud'],
      date: new Date()
    },
    {
      title: '全部开源，个人与企业可 100% 直接使用，无需授权',
      type: '通知',
      keys: ['通知', '无需授权'],
      date: new Date()
    },
    {
      title: '国内使用最广泛的快速开发平台，超 300+ 人贡献',
      type: '公告',
      keys: ['公告', '最广泛'],
      date: new Date()
    }
  ]
  notice = Object.assign(notice, data)
}

// 获取快捷入口
let shortcut = reactive<Shortcut[]>([])

const getShortcut = async () => {
  const data = [
    {
      name: 'Github',
      icon: 'akar-icons:github-fill',
      url: 'github.io'
    },
    {
      name: 'Vue',
      icon: 'logos:vue',
      url: 'vuejs.org'
    },
    {
      name: 'Vite',
      icon: 'vscode-icons:file-type-vite',
      url: 'https://vitejs.dev/'
    },
    {
      name: 'Angular',
      icon: 'logos:angular-icon',
      url: 'github.io'
    },
    {
      name: 'React',
      icon: 'logos:react',
      url: 'github.io'
    },
    {
      name: 'Webpack',
      icon: 'logos:webpack',
      url: 'github.io'
    }
  ]
  shortcut = Object.assign(shortcut, data)
}

// 获取快捷菜单
let shortcutMenu = reactive<Shortcut[]>([])

const getShortcutMenu = async () => {
  const data = [
    {
      name: '用户管理',
      icon: 'ep:avatar',
      url: 'github.io'
    },
    {
      name: '角色管理',
      icon: 'ep:user',
      url: 'vuejs.org'
    },
    {
      name: '部门管理',
      icon: 'fa:address-card',
      url: 'https://vitejs.dev/'
    },
    {
      name: '岗位管理',
      icon: 'fa:address-book-o',
      url: 'github.io'
    },
    {
      name: '字典管理',
      icon: 'ep:collection',
      url: 'github.io'
    },
    {
      name: '功能管理',
      icon: 'ep:avatar',
      url: 'github.io'
    },
    {
      name: '菜单管理',
      icon: 'ep:menu',
      url: 'github.io'
    },
    {
      name: '消息中心',
      icon: 'ep:chat-dot-round',
      url: 'github.io'
    }
  ]
  shortcutMenu = Object.assign(shortcutMenu, data)
}

// 用户来源
const getUserAccessSource = async () => {
  const data = [
    { value: 335, name: 'analysis.directAccess' },
    { value: 310, name: 'analysis.mailMarketing' },
    { value: 234, name: 'analysis.allianceAdvertising' },
    { value: 135, name: 'analysis.videoAdvertising' },
    { value: 1548, name: 'analysis.searchEngines' }
  ]
  set(
    pieOptionsData,
    'legend.data',
    data.map((v) => t(v.name))
  )
  pieOptionsData!.series![0].data = data.map((v) => {
    return {
      name: t(v.name),
      value: v.value
    }
  })
}
const barOptionsData = reactive<EChartsOption>(barOptions) as EChartsOption
const lineOptionsData = reactive<EChartsOption>(lineOptions) as EChartsOption

// 周活跃量
const getWeeklyUserActivity = async () => {
  const data = [
    { value: 13253, name: 'analysis.monday' },
    { value: 34235, name: 'analysis.tuesday' },
    { value: 26321, name: 'analysis.wednesday' },
    { value: 12340, name: 'analysis.thursday' },
    { value: 24643, name: 'analysis.friday' },
    { value: 1322, name: 'analysis.saturday' },
    { value: 1324, name: 'analysis.sunday' }
  ]
  set(
    barOptionsData,
    'xAxis.data',
    data.map((v) => t(v.name))
  )
  set(
    barOptionsData,
    'yAxis.splitLine.show',
    false
  )
  set(barOptionsData, 'series', [
    {
      data: data.map((v) => v.value),
      type: 'bar',
      barWidth:'12'
    }
  ])
  set(
    barOptionsData,
    'title.show',
    false
  )
  set(
    lineOptionsData,
    'xAxis.data',
    data.map((v) => t(v.name))
  )
  set(
    lineOptionsData,
    'yAxis.splitLine.show',
    false
  )
  set(
    lineOptionsData,
    'legend',
    {
      data:['图例1','图例2']
    }
  )
  set(
    lineOptionsData,
    'title.show',
    false
  )
  set(lineOptionsData, 'series', [
    {
      data: data.map((v) => v.value+(Math.random()*10).toFixed(2)),
      type: 'line',
      smooth: true,
      name:'图例1',
      showSymbol: false,
      clip: true,
    },
    {
      data: data.map((v) => v.value+(Math.random()*100).toFixed(2)),
      type: 'line',
      smooth: true,
      name:'图例2',
      showSymbol: false,
      clip: true,
    }
  ])
  console.log(lineOptions,'lineOptions');
  
}

const getAllApi = async () => {
  await Promise.all([
    getCount(),
    getProject(),
    getNotice(),
    getShortcut(),
    getShortcutMenu(),
    getUserAccessSource(),
    getWeeklyUserActivity()
  ])
  loading.value = false
}

getAllApi()
</script>
<style lang="scss" scoped>
  .top-div{
    background-image: url('@/assets/svgs/login_bg4.webp');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    height: 170px;
    border-radius: 5px;
    padding: 30px;
    &-item {
      width: 110px;
      height: 90px;
      background: #fff;
      border-radius: 5px;
      margin-right: 20px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      padding: 10px;
    }
  }
</style>
