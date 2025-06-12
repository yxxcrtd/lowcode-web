<script setup lang="ts">
import AceCascader from '@/components/ace/ace-cascader/index.vue'
import AceSelect from '@/components/ace/ace-select/index.vue'
import AceRadio from '@/components/ace/ace-radio/index.vue'
import AceCheckBox from '@/components/ace/ace-check-box/index.vue'
import AceInput from '@/components/ace/ace-input/index.vue'
import AceInputCurrency from '@/components/ace/ace-input-currency/index.vue'
import AceInputNumber from '@/components/ace/ace-input-number/index.vue'
import AceSelectTable from '@/components/ace/ace-select-table/index.vue'
import AceAreaSelect from "@/components/ace/ace-area-select/index.vue";

import {
  SelectComponents,
  SelectDbTable,
  SelectTrustTree,
  SelectUser,
  SelectDept,
  Attachment
} from '@/components-yt'

import { ref } from 'vue'
import { fa } from 'element-plus/es/locale'
const activeNames = ref(['1', '2'])
const handleChange = (val: string[]) => {
  console.log(val)
}
let value = ref('')
let form = reactive({
  name: '',
  name1: {},
  test: {},
  list: [],
  radio: '',
  selectTabsTableSingle: null,
  selectTabsTableMultiple: null,
  selectComponents: 'el-radio',
  selectDbTable: '',
  selectTrustTreeSingle: 10030102,
  selectTrustTreeMultiple: [10030102],
  selectDeptSingle: '',
  selectDeptAll: '',
  selectDeptMultiple: [],
  selectUserSingle: '1',
  selectUserAll: [],
  selectUserMultiple: []
})
let dataList = ref([
  { label: 'ceshi 1', value: '1' },
  { label: 'ceshi 1', value: '1' },
  { label: 'ceshi 1', value: '1' },
  { label: 'ceshi 1', value: '1' },
  { label: 'ceshi 1', value: '1' },
  { label: 'ceshi 1', value: '1' },
  { label: 'ceshi 1', value: '1' },
  { label: 'ceshi 1', value: '1' }
])
let dataList1 = ref([
  { label: 'ceshi 1', value: '1' },
  { label: 'ceshi 1', value: '2' }
])

const tabsList = ref([
  { label: '测试一', value: '1', key: '1' },
  { label: '测试二', value: '2', key: '2' }
])

const attachmentRefOne = ref(null)
const attachmentRefTwo = ref(null)
const attachmentRefThree = ref(null)
const attachmentListOne = ref([
  {
    fileName: 'test.doc',
    fileId: '1',
    size: '100KB',
    url: 'https://www.baidu.com/ceshi.doc'
  }
])
const attachmentListThree = ref([])

const appointAttachmentList = ref([
  {
    title:'信息披露/资金管理报告',
    fileCount:1,
    fileType:'xls,ppt',
    fileSize:10,
    isRequire:1,
    isValidName:1,
    fileList:[
      {title:'资金管理报告',type:'xls',size:10000},
    ]
  },{
    title:'信息披露/资金管理报告',
    fileCount:1,
    fileType:'xls,ppt',
    fileSize:10,
    isRequire:1,
    isValidName:1,
    fileList:[
      {title:'资金管理报告',type:'xls',size:10000},
    ]
  },{
    title:'信息披露/资金管理报告',
    fileCount:1,
    fileType:'xls,ppt',
    fileSize:10,
    isValidName:1,
    fileList:[
      {title:'资金管理报告',type:'xls',size:10000},
    ]
  }
])

const columnsTestTable = reactive([
  {
    title: '岗位名称',
    align: 'center',
    dataIndex: 'name',
    field: 'name'
  },
  {
    title: '岗位编码',
    align: 'center',
    dataIndex: 'code',
    field: 'code'
  }
])

const columnsTabsTable = reactive([
  {
    title: '岗位名称',
    align: 'center',
    dataIndex: 'name',
    field: 'name'
  },
  {
    title: '岗位编码',
    align: 'center',
    dataIndex: 'code',
    field: 'code'
  }
])

</script>
<template>
  <div>
    <div class="demo-collapse">
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item title="表单测试" name="1">
          <template #title>
            <div class="head-container">
              <div class="title">表单测试</div>
            </div>
          </template>
          <div class="content-container">
            <el-form :model="form" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="测试1">
                    <ace-input v-model="form.name"></ace-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Activity zone">
                    <ace-select v-model="form.test" :dataSource="dataList"></ace-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Activity type">
                    <ace-check-box v-model="form.list" :data-list="dataList"></ace-check-box>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="Resources">
                    <ace-radio :data-list="dataList1" v-model="form.radio"></ace-radio>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Activity form">
                    <ace-input-number v-model="form.name" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Activity form">
                    <ace-input-currency v-model="form.name" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="Activity form">
                    <ace-select-table
                      :columns="columnsTestTable"
                      :query-key-name="'name'"
                      :data-url="'/system/post/page'"
                      v-model="form.name1"
                      v-model:show-label="form.name1Text"
                    >
                    </ace-select-table>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  {{ '单选用户-当前用户部门: ' + form.selectUserSingle }}
                  <el-form-item label="单选用户">
                    <SelectUser v-model="form.selectUserSingle" :currentUserDept="true"/>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  {{ '多选用户-指定部门: ' + form.selectUserMultiple }}
                  <el-form-item label="多选用户">
                    <SelectUser v-model="form.selectUserMultiple" :multiple="true" :specificDeptId="104"/>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  {{ '多选用户-全量用户: ' + form.selectUserAll }}
                  <el-form-item label="多选用户">
                    <SelectUser v-model="form.selectUserAll" :multiple="true"/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  {{ '多选部门-指定部门: ' + form.selectDeptMultiple }}
                  <el-form-item label="多选部门">
                    <SelectDept v-model="form.selectDeptMultiple" :multiple="true" :specificDeptId="104"/>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  {{ '单选部门-当前用户部门: ' + form.selectDeptSingle }}
                  <el-form-item label="单选部门">
                    <SelectDept v-model="form.selectDeptSingle" :currentUserDept="true" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  {{ '单选部门-全量部门: ' + form.selectDeptAll }}
                  <el-form-item label="单选部门">
                    <SelectDept v-model="form.selectDeptAll" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  {{ '多选下拉表格: ' + form.selectTabsTableMultiple }}
                  <el-form-item label="多选下拉表格">
                    <ace-select-tabs-table
                      :columns="columnsTabsTable"
                      :tabsList="tabsList"
                      :sourceUrl="'/system/post/page'"
                      :defaultActiveTab="'1'"
                      :multiple="true"
                      :showLabel="['项目经理']"
                      v-model="form.selectTabsTableMultiple"
                    >
                    </ace-select-tabs-table>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  {{ '单选下拉表格: ' + form.selectTabsTableSingle }}
                  <el-form-item label="单选下拉表格">
                    <ace-select-tabs-table
                      :columns="columnsTabsTable"
                      :tabsList="tabsList"
                      :sourceUrl="'/system/post/page'"
                      :defaultActiveTab="'2'"
                      :multiple="false"
                      showLabel="项目经理"
                      v-model="form.selectTabsTableSingle"
                    >
                    </ace-select-tabs-table>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  {{ '组件编码: ' + form.selectComponents }}
                  <el-form-item label="选择组件">
                    <select-components v-model="form.selectComponents" showLabel="单选框"></select-components>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  {{ '表Id: ' + form.selectDbTable }}
                  <el-form-item label="选择表">
                    <select-db-table v-model="form.selectDbTable" showLabel="单选框"></select-db-table>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  {{ '单选-信托三分类Id: ' + form.selectTrustTreeSingle }}
                  <el-form-item label="选择树">
                    <select-trust-tree v-model="form.selectTrustTreeSingle"></select-trust-tree>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  {{ '多选-信托三分类Id: ' + form.selectTrustTreeMultiple }}
                  <el-form-item label="选择树">
                    <select-trust-tree v-model="form.selectTrustTreeMultiple" :multiple="true"></select-trust-tree>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-collapse-item>
        <el-collapse-item title="附件列表测试" name="2">
          <template #title>
            <div class="head-container">
              <div class="title">附件列表测试</div>
            </div>
          </template>
          <div class="content-container">
            {{ attachmentListOne }}
            <Attachment
              ref="attachmentRefOne"
              v-model="attachmentListOne"
              :attachmentInfo="{
                attachmentType: '',
                uploadMode: '',
                showPreview: true,
                showDownload: true,
                showDelete: false
              }"
              :enableMultiple="true"
              :upload-config="{}"
              height="300"
            />
            {{ appointAttachmentList }}
            <Attachment
              ref="attachmentRefTwo"
              v-model="appointAttachmentList"
              :attachmentInfo="{
                attachmentType: 'appointAttachment',
                uploadMode: 'immediate',
                showPreview: true,
                showDownload: true,
                showDelete: true,
                uploadFileList: [{}]
              }"
            />
            <Attachment
              ref="attachmentRefThree"
              v-model="attachmentListThree"
              :attachmentInfo="{
                attachmentType: 'selectAttachment'
              }"
            />
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-collapse-item__header) {
  border-bottom: 1px solid var(--app-content-bg-color);
}
.head-container {
  width: 100%;
  padding: 10px;
  .title {
    text-align: left;
    //width: 100%;
    height: 40px;
    line-height: 40px;
  }
}
.content-container {
  padding: 10px;
}
</style>
