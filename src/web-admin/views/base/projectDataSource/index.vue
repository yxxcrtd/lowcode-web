<template>
  <el-row :gutter="20">
    <!-- 左侧部门树 -->
    <el-col :xs="24">
      <!-- 搜索 -->
      <ContentWrap>
        <el-form
          class="-mb-15px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="100px"
        >
          <el-form-item label="数据类型名称" prop="username">
            <el-input
              v-model="queryParams.username"
              placeholder="请输入数据类型名称"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
<!--          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="组件状态"
              clearable
              class="!w-240px"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>-->
          <el-form-item>
            <el-button @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
            <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
      <div class="mb-10px ml-20px">
        <el-button
          type="primary"
          plain
          @click="openForm(false)"
          v-hasPermi="['system:user:create']"
        >
          <Icon icon="ep:plus" /> 新增
        </el-button>
      </div>
      <ContentWrap>
        <JVxeTable ref="jVxeTable" :columns="columns" :row-height="58" :data-source="listQ">
          <template #action_default="{ row }">
            <div>
              <el-button size="small"  @click="openForm(true,row.id)">编辑</el-button>
              <el-divider direction="vertical" />
              <el-button  danger size="small" @click="currentChange(row)">删除</el-button>
            </div>
          </template>
        </JVxeTable>
      </ContentWrap>
    </el-col>
  </el-row>
  <Dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1000"
  >
    <div class="page-container">
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
      >
        <el-form-item label="类型名" prop="name">
          <el-input v-model="ruleForm.name" />
        </el-form-item>
        <el-form-item label="数据类型" prop="region">
          <el-select v-model="ruleForm.region" placeholder="">
            <el-option label="可变字符串" value="varchar" />
            <el-option label="固定字符串" value="char" />
          </el-select>
        </el-form-item>
        <el-form-item label="长度" prop="name">
          <el-input v-model="ruleForm.name" />
        </el-form-item>
        <el-form-item label="小数位" prop="name">
          <el-input v-model="ruleForm.name" />
        </el-form-item>
        <el-form-item label="备注" prop="desc">
          <el-input v-model="ruleForm.desc" type="textarea" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确认
        </el-button>
      </div>
    </template>
  </Dialog>
  <!-- 添加或修改用户对话框 -->
</template>
<script lang="ts" setup>
import { columns } from './data';
import {getUserPage} from "./api";
import * as UserApi from '@/api/system/user'
import {ref} from "vue";

defineOptions({ name: 'SystemUser' })

/*const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化*/
let listQ = ref([])
const getTestList = async () => {
  const {list} = await getUserPage(queryParams)
  listQ.value = list
  console.log(listQ)
}
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  username: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserApi.getUserPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const currentChange = (row)=>{
  console.log(row)
}
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}


/** 添加/修改操作 */
const dialogVisible = ref(false)
const dialogTitle = ref('新增')
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'

interface RuleForm {
  name: string
  region: string
  count: string
  date1: string
  date2: string
  delivery: boolean
  location: string
  type: string[]
  resource: string
  desc: string
}

const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: 'Hello',
  region: '',
  count: '',
  date1: '',
  date2: '',
  delivery: false,
  location: '',
  type: [],
  resource: '',
  desc: '',
})
const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],
  region: [
    {
      required: true,
      message: 'Please select Activity zone',
      trigger: 'change',
    },
  ],
  count: [
    {
      required: true,
      message: 'Please select Activity count',
      trigger: 'change',
    },
  ],
  date1: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a date',
      trigger: 'change',
    },
  ],
  date2: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a time',
      trigger: 'change',
    },
  ],
  location: [
    {
      required: true,
      message: 'Please select a location',
      trigger: 'change',
    },
  ],
  type: [
    {
      type: 'array',
      required: true,
      message: 'Please select at least one activity type',
      trigger: 'change',
    },
  ],
  resource: [
    {
      required: true,
      message: 'Please select activity resource',
      trigger: 'change',
    },
  ],
  desc: [
    { required: true, message: 'Please input activity form', trigger: 'blur' },
  ],
})

const openForm = (flag:boolean,id = '') => {
  dialogTitle.value = flag?'修改':dialogTitle.value
  dialogVisible.value = true
  console.log(id)
}

onMounted(() => {
  getTestList()
})
</script>
<style lang="scss" scoped>
.dialog-footer{
  text-align: center;
}
</style>
