<template>
  <div class="from-content">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      :size="formSize"
      status-icon
    >
      <AnchorContent :anchor-list="list">
        <template #1-1>
          <div class="content">
            <div class="content">
              <div class="flex-50 form-item">
                <el-form-item label="默认查询" prop="name">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="行号" prop="region">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="行号起始数字" prop="name">
                  <el-input v-model="ruleForm.name"/>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="每页行号默认起始" prop="name">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio value="Y">从1开始</el-radio>
                    <el-radio value="N">根据记录开始</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="斑马纹" prop="name">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="边框" prop="name">
                  <el-select v-model="ruleForm.region">
                    <el-option label="完整边框" value="right" />
                    <el-option label="外边框" value="left" />
                    <el-option label="内边框" value="right" />
                    <el-option label="无边框" value="right" />
                  </el-select>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="选择框类型" prop="name">
                  <el-select v-model="ruleForm.region" placeholder="Activity zone">
                    <el-option label="单选" value="default" />
                    <el-option label="复选" value="large" />
                    <el-option label="无" value="small" />
                  </el-select>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="操作列宽度" prop="name">
                  <el-input v-model="ruleForm.name"/>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="固定操作列" prop="name">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="固定流程列" prop="name">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="分页显示" prop="name">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="分页大小" prop="name">
                  <el-select v-model="ruleForm.region" placeholder="Activity zone">
                    <el-option label="10" value="default" />
                    <el-option label="20" value="large" />
                    <el-option label="50" value="small" />
                    <el-option label="100" value="small" />
                    <el-option label="200" value="small" />
                  </el-select>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="树形表格" prop="name">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="是否流程" prop="name">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="展示风格" prop="name">
                  <el-select v-model="ruleForm.region" placeholder="Activity zone">
                    <el-option label="默认风格" value="default" />
                    <el-option label="门户风格" value="large" />
                  </el-select>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="查询框文本宽度" prop="name">
                  <el-input v-model="ruleForm.name"/>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="查询框文本对齐" prop="name">
                  <el-select v-model="ruleForm.region" placeholder="Activity zone">
                    <el-option label="左对齐" value="default" />
                    <el-option label="居中" value="large" />
                    <el-option label="右对齐" value="large" />
                  </el-select>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="用户自定义查询" prop="name">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="列表上方间隔" prop="name">
                  <el-input v-model="ruleForm.name"/>
                </el-form-item>
              </div>
              <div class="flex-50 form-item">
                <el-form-item label="自定义标题" prop="name">
                  <el-input v-model="ruleForm.name"/>
                </el-form-item>
              </div>
            </div>
          </div>
        </template>
        <template #1-2>
          <div class="content">
            <div class="flex-50 form-item">
              <el-form-item label="标签的长度" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="星号位置" prop="region">
                <el-select v-model="ruleForm.region">
                  <el-option label="左" value="left" />
                  <el-option label="右" value="right" />
                </el-select>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="行内表单模式" prop="name">
                <el-select v-model="ruleForm.region">
                  <el-option label="是" value="left" />
                  <el-option label="否" value="right" />
                </el-select>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="表单域标签的后缀" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="表单域标签的位置" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="是否显示校验错误信息" prop="name">
                <el-select v-model="ruleForm.region">
                  <el-option label="是" value="left" />
                  <el-option label="否" value="right" />
                </el-select>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="单内组件的尺寸" prop="name">
                <el-select v-model="ruleForm.region" placeholder="Activity zone">
                  <el-option label="默认" value="default" />
                  <el-option label="大" value="large" />
                  <el-option label="小" value="small" />
                </el-select>
              </el-form-item>
            </div>
          </div>
        </template>
        <template #1-3>
          <div class="content">
            <div class="flex-100 form-item">
              <el-form-item label="占位符设置" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
          </div>
        </template>
        <template #1-4>
          <div class="content">
            <div class="flex-50 form-item">
              <el-form-item label="系统字段2" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="系统字段3" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="系统字段3" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="系统字段3" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="系统字段2" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="系统字段3" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="系统字段3" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
            <div class="flex-50 form-item">
              <el-form-item label="系统字段3" prop="name">
                <el-input v-model="ruleForm.name"/>
              </el-form-item>
            </div>
          </div>
        </template>
      </AnchorContent>
      <div class="form-btn">
        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            Create
          </el-button>
          <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>

</template>
<script setup lang="ts">
import AnchorContent from "@/web-admin/views/base/components/AnchorContent.vue";
const list = ref([{id:'1-1',title:'表格设置',icon:'grid'},{id:'1-2',title:'表单设置',icon:'tickets'},
  {id:'1-3',title:'占位符设置',icon:'magic-stick'},{id:'1-4',title:'卡片设置',icon:'postcard'},])
import type {ComponentSize, FormInstance, FormRules} from 'element-plus'

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
    {required: true, message: 'Please input Activity name', trigger: 'blur'},
    {min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur'},
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
    {required: true, message: 'Please input activity form', trigger: 'blur'},
  ],
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>

<style scoped lang="scss">
.from-content {
  width: 100%;
  position:relative;
  .content {
    display: flex;
    flex-wrap: wrap;

    .form-item {
      padding: 15px;
      box-sizing: border-box;
    }

    .flex-100 {
      flex-basis: 100%;
    }

    .flex-50 {
      flex-basis: 50%;
    }
  }

  .form-btn{
    margin-top: 10px;
    position: fixed;
    left:50%;
    transform: translateX(-50%);
  }
}
</style>
