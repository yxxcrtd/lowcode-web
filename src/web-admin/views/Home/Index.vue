<template>
  <div style="height: 100%;overflow-y: auto;">
    <el-row class="mt-8px" :gutter="8" justify="space-between">
      <el-col :xl="18" :lg="18" :md="24" :sm="24" :xs="24" class="mb-8px">
        <el-card shadow="never">
          <el-skeleton :loading="loading" animated>
            <el-row>
              <el-col
                v-for="(item, index) in topMessageList"
                :key="`card-${index}`"
                :xl="6"
                :lg="6"
                :md="6"
                :sm="24"
                :xs="24"
              >
                <div class="mr-5px mt-5px">
                  <div class="flex items-center">
                    <Icon :icon="item.img" :size="25" class="mr-8px" />
                    <div>
                      <div class="text-12px">{{ item.name }}</div>
                      <div class="text-18px font-bold">{{ item.num }}{{ item.unit }}</div>
                      <div class="text-12px">{{ item.minName }}{{ item.minNum }}{{ item.unit }}</div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-skeleton>
        </el-card>
        <el-row class="mt-8px" :gutter="8" justify="space-between">
          <el-col :xl="16" :lg="16" :md="24" :sm="24" :xs="24" class="mb-8px">
            <el-card shadow="never">
              <template #header>
                <div class="h-3 flex justify-between">
                  <span>表1</span>
                  <el-link
                    type="primary"
                    :underline="false"
                    href="https://github.com/yudaocode"
                    target="_blank"
                  >
                    查看更多
                  </el-link>
                </div>
              </template>
              <el-skeleton :loading="loading" animated>
                <Echart :options="lineOptions" :height="280" />
              </el-skeleton>
            </el-card>
          </el-col>
          <el-col :xl="8" :lg="8" :md="24" :sm="24" :xs="24" class="mb-8px">
            <el-card shadow="never">
              <template #header>
                <div class="h-3 flex justify-between">
                  <span>表2</span>
                  <el-link
                    type="primary"
                    :underline="false"
                    href="https://github.com/yudaocode"
                    target="_blank"
                  >
                    查看更多
                  </el-link>
                </div>
              </template>
              <el-skeleton :loading="loading" animated>
                <div style="height: 280px;"></div>
              </el-skeleton>
            </el-card>
          </el-col>
        </el-row>
        <el-row class="mt-8px" :gutter="8" justify="space-between">
          <el-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24" class="mb-8px">
            <el-card shadow="never">
              <template #header>
                <div class="h-3 flex justify-between">
                  <span>表3</span>
                  <el-link
                    type="primary"
                    :underline="false"
                    href="https://github.com/yudaocode"
                    target="_blank"
                  >
                    查看更多
                  </el-link>
                </div>
              </template>
              <el-skeleton :loading="loading" animated>
                <Echart :options="barOptionsData" :height="280" />
              </el-skeleton>
            </el-card>
          </el-col>
          <el-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24" class="mb-8px">
            <el-card shadow="never">
              <template #header>
                <div class="h-3 flex justify-between">
                  <span>用户访问来源</span>
                  <el-link
                    type="primary"
                    :underline="false"
                    href="https://github.com/yudaocode"
                    target="_blank"
                  >
                    查看更多
                  </el-link>
                </div>
              </template>
              <el-skeleton :loading="loading" animated>
                <Echart :options="pieOptionsData" :height="280" />
              </el-skeleton>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
      <el-col :xl="6" :lg="6" :md="24" :sm="24" :xs="24" class="mb-8px">
        <el-card shadow="never">
          <el-skeleton :loading="loading" animated>
            <div style="background-color: rgba(64, 158, 255,0.2);color:#409eff;border-radius: 5px;padding: 5px 10px;justify-content: center;align-items: center;" class="flex ">
              <Icon icon="ep:circle-plus" />
              <span>快速新建</span>
            </div>
            <div style="border-bottom: 1px dashed #999;margin-top: 10px;">
              <div class="text-15px font-bold">最近访问</div>
              <el-row>
                <el-col v-for="item in shortcut" :key="`team-${item.name}`" :span="8" class="mb-8px">
                  <div class="flex items-center" style="flex-direction: column;padding: 10px 0;">
                    <Icon :icon="item.icon" />
                    <el-link type="default" class="text-13px" :underline="false" @click="setWatermark(item.name)">
                      {{ item.name }}
                    </el-link>
                  </div>
                </el-col>
              </el-row>
            </div>
            <div class="mt-16px">
              <div class="flex justify-between">
                <span class="text-15px font-bold">快捷入口</span>
                <el-link
                    type="primary"
                    :underline="false"
                    href="https://github.com/yudaocode"
                    target="_blank"
                  >
                    管理
                  </el-link>
                </div>
              <el-row>
                <el-col v-for="item in shortcut" :key="`team-${item.name}`" :span="8" class="mb-8px">
                  <div class="flex items-center" style="flex-direction: column;padding: 10px 0;">
                    <Icon :icon="item.icon" />
                    <el-link type="default" class="text-13px" :underline="false" @click="setWatermark(item.name)">
                      {{ item.name }}
                    </el-link>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-skeleton>
        </el-card>
        <el-card shadow="never" class="mt-8px">
          <template #header>
            <div class="h-3 flex justify-between">
              <span>帮助中心</span>
              <el-link type="primary" :underline="false">{{ t('action.more') }}</el-link>
            </div>
          </template>
          <el-skeleton :loading="loading" animated>
            <div v-for="(item, index) in notice" :key="`dynamics-${index}`">
              <div class="flex items-center">
                <!-- <el-avatar :src="avatar" :size="35" class="mr-16px">
                  <img src="@/assets/imgs/avatar.gif" alt="" />
                </el-avatar> -->
                <div>
                  <div class="text-14px">
                    <Highlight :keys="item.keys.map((v) => t(v))">
                      {{ item.type }} {{ item.title }}
                    </Highlight>
                  </div>
                  <div class="mt-16px text-12px text-gray-400">
                    {{ formatTime(item.date, 'yyyy-MM-dd') }}
                  </div>
                </div>
              </div>
              <el-divider />
            </div>
          </el-skeleton>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import { set } from 'lodash-es'
import { EChartsOption } from 'echarts'
import { formatTime } from '@/utils'

import { useUserStore } from '@/store/modules/user'
import { useWatermark } from '@/hooks/web/useWatermark'
import type { WorkplaceTotal, Project, Notice, Shortcut, TopMessage } from './types'
import { pieOptions, barOptions, lineOptions } from './echarts-data'

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

const getCount = async () => {
  const data = {
    project: 40,
    access: 2340,
    todo: 10
  }
  totalSate = Object.assign(totalSate, data)
}

// 获取顶层信息
let topMessageList = reactive<TopMessage[]>([])
const getTopMessageList = async () => {
  const data = [
    {
      name:'服务器',
      img:'akar-icons:github-fill',
      num:'12',
      unit:'',
      minName:'异常服务器:',
      minNum:'1'
    },
    {
      name:'数据库',
      img:'logos:vue',
      num:'12',
      unit:'',
      minName:'单体架构',
      minNum:'1512'
    },
    {
      name:'应用总数',
      img:'akar-icons:github-fill',
      num:'12',
      unit:'%',
      minName:'单体架构',
      minNum:'1512'
    },
    {
      name:'API总数',
      img:'logos:vue',
      num:'12',
      unit:'%',
      minName:'单体架构',
      minNum:'1512'
    },
  ]
  topMessageList = Object.assign(topMessageList, data)
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
      data:['图例1','图例2','图例3']
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
      name:'图例1',
      showSymbol: false,
      clip: true,
    },
    {
      data: data.map((v) => v.value+(Math.random()*100).toFixed(2)),
      type: 'line',
      name:'图例2',
      showSymbol: false,
      clip: true,
    },
    {
      data: data.map((v) => v.value+(Math.random()*510).toFixed(2)),
      type: 'line',
      name:'图例3',
      showSymbol: false,
      clip: true,
    }
  ])
  console.log(lineOptions,'lineOptions');
  
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
      name: '功能管理',
      icon: 'vscode-icons:file-type-vite',
      url: '/dev'
    },
    {
      name: '菜单管理',
      icon: 'logos:vue',
      url: '/dev'
    },
    {
      name: '用户管理',
      icon: 'vscode-icons:file-type-vite',
      url: 'https://vitejs.dev/'
    },
    {
      name: '权限管理',
      icon: 'logos:angular-icon',
      url: 'github.io'
    },
    {
      name: '字典管理',
      icon: 'logos:react',
      url: 'github.io'
    },
    {
      name: '操作日志',
      icon: 'logos:webpack',
      url: 'github.io'
    }
  ]
  shortcut = Object.assign(shortcut, data)
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
    'title.show',
    false
  )
  set(
    pieOptionsData,
    'legend.left',
    'right'
  )
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

const getAllApi = async () => {
  await Promise.all([
    getCount(),
    getTopMessageList(),
    getProject(),
    getNotice(),
    getShortcut(),
    getUserAccessSource(),
    getWeeklyUserActivity()
  ])
  loading.value = false
}

getAllApi()
</script>
