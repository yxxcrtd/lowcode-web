<template>
  <Dialog v-model="dialogVisible" :title="title" width="800">
    <div class="dialog-content">
      <el-form ref="formRef" :rules="rules" :model="groupForm" label-width="120">
        <!-- 固定在顶部的基础字段 -->
        <el-row class="basic-fields">
          <el-col :span="12">
            <el-form-item label="分组名称" prop="groupName">
              <el-input v-model="groupForm.groupName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分组编码" prop="groupCode">
              <el-input v-model="groupForm.groupCode" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级分组" prop="parentId">
              <el-tree-select
                v-model="groupForm.parentId"
                :data="defaultGroupList"
                :props="defaultProp"
                check-strictly
                clearable
                :highlight-current="true"
                :render-after-expand="false"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input v-model="groupForm.groupSort" type="number" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 配置选项卡 -->
        <el-tabs v-model="activeTab" class="config-tabs">
          <el-tab-pane label="基础配置" name="basic">
            <el-row>
              <el-col :span="12">
                <el-form-item label="默认是否隐藏" prop="isHidden">
                  <el-switch
                    v-model="groupForm.isHidden"
                    :active-value="true"
                    :inactive-value="false"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
              </el-col>
              <el-col :span="12">
                <el-form-item label="插槽" prop="groupSlot">
                  <SelectRenderPlugins v-model="groupForm.groupSlot"></SelectRenderPlugins>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="头部提示语" prop="groupHeadTips">
                  <el-button
                    text
                    type="primary"
                    @click="openDialog('head',groupForm.groupHeadTips)"
                    :class="groupForm.groupHeadTips ? 'green-text' : ''"
                  >
                    配置
                  </el-button>
                  <el-popconfirm
                    title="确定清空配置?"
                    @confirm="clearTips('groupHeadTips')"
                    v-if="groupForm.groupHeadTips"
                  >
                    <template #reference>
                      <el-icon class="cfg-del-btn" title="清空配置">
                        <Delete />
                      </el-icon>
                    </template>
                  </el-popconfirm>
                  <!-- <CodeEditor style="height: 300px;" v-model="groupForm.groupHeadTips" :initCode="initCode"></CodeEditor> -->
                  <!-- <el-input
                    v-model="groupForm.groupHeadTips"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入分组头部提示语"
                  /> -->
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="尾部提示语" prop="groupFootTips">
                  <el-button
                    text
                    type="primary"
                    @click="openDialog('foot',groupForm.groupFootTips)"
                    :class="groupForm.groupFootTips ? 'green-text' : ''"
                  >
                    配置
                  </el-button>
                  <el-popconfirm
                    title="确定清空配置?"
                    @confirm="clearTips('groupFootTips')"
                    v-if="groupForm.groupFootTips"
                  >
                    <template #reference>
                      <el-icon class="cfg-del-btn" title="清空配置">
                        <Delete />
                      </el-icon>
                    </template>
                  </el-popconfirm>
                  <!-- <CodeEditor style="height: 300px;" v-model="groupForm.groupFootTips" :initCode="initCode"></CodeEditor> -->
                  <!-- <el-input
                    v-model="groupForm.groupFootTips"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入分组尾部提示语"
                  /> -->
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="尾部插槽" prop="groupFailSlot">
                  <SelectRenderPlugins v-model="groupForm.groupFailSlot"></SelectRenderPlugins>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="高级配置" name="advanced">
            <el-row>
              <el-col :span="24">
                <el-form-item label="默认文字" prop="groupTips">
                  <el-input v-model="groupForm.groupTips" type="textarea" :rows="2" placeholder="请输入默认文字" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="链接名称" prop="groupLinkName">
                  <el-input v-model="groupForm.groupLinkName" placeholder="请输入链接名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="链接类型" prop="groupLinkType">
                  <el-select v-model="groupForm.groupLinkType" placeholder="请选择链接类型">
                    <el-option label="新页签" value="newTab" />
                    <el-option label="弹框" value="dialog" />
                    <el-option label="抽屉" value="drawer" />
                    <el-option label="新页面" value="newPage" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="链接地址" prop="groupLinkAddress">
                  <el-input v-model="groupForm.groupLinkAddress" placeholder="请输入链接地址" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="子分组展示方式" prop="groupDisplay">
                  <el-select v-model="groupForm.groupDisplay" clearable placeholder="请选择展示方式">
                    <el-option label="平铺" value="normal" />
                    <el-option label="表格" value="table" />
                    <el-option label="合并表格" value="mergedTable" />
                    <el-option label="Tab标签" value="tabs" />
                  </el-select>
                </el-form-item>
              </el-col>
              <!-- 表格模式的配置项 -->
              <template v-if="groupForm.groupDisplay === 'table' || groupForm.groupDisplay === 'mergedTable'">
                <el-col :span="24">
                  <el-form-item label="表格标题" prop="groupTitle">
                    <el-input
                      v-model="groupForm.groupTitle"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入标题,多个标题以逗号隔开,如aa,bb"
                    />
                  </el-form-item>
                </el-col>
              </template>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="显隐规则" name="showorhidden" lazy>
            <el-row>
              <el-col :span="24">
                <ConditionConfig v-model="groupForm.showConfig" :fieldList="fieldList"></ConditionConfig>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </template>
  </Dialog>
  <Dialog v-model="tipsDialogVisible" :title="tipsType === 'head'?'头部提示语脚本配置':'尾部提示语脚本配置'" width="700">
    <div class="dialog-content-tips">
      <CodeEditor v-model="groupTips" :initCode="initCode"></CodeEditor>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="tipsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTips">确定</el-button>
      </div>
    </template>
  </Dialog>

</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { cloneDeep } from 'lodash-es'
import { propTypes } from '@/utils/propTypes'
import ConditionConfig from '@/web-admin/views/funMng/dev/Components/ConditionConfig.vue'
import SelectRenderPlugins from '@/web-admin/views/funMng/dev/Components/SelectRenderPlugins.vue'
import { Delete } from '@element-plus/icons-vue'
defineOptions({ name: 'EditGroupDialog' })

const props = defineProps({
  groupList: propTypes.array.def([]),
  fieldList: propTypes.array.def([]),
  templateApiList: propTypes.array.def([])
})

const defaultProp = {
  children: 'children',
  label: 'groupName',
  value: 'groupCode'
}
const initCode=` function customEvent(ctx,formData){
    //formData 表单信息
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】
    //或具体结构【formData['1894191348934537217']['PROJECT_NAME_1894191348934537217']】格式
    //渲染引擎公共方法库
    return ''
    // 可以直接返回文本
}
`
const processTreeData = (data) => {
  return data.map(item => ({
    ...item,
    children: [] // 直接清空所有子节点
  }))
}

const defaultGroupList = computed(() => {
  return processTreeData(props.templateApiList[curApiIndex.value].pageGroupsTree)
})

const message = useMessage()
const dialogVisible = ref(false)
const activeTab = ref('basic')
const bizType = ref('create')
const title = ref('添加分组')
const formRef = ref()
const curApiIndex = ref()
const groupForm = ref({
  groupCode: '',
  groupName: '',
  parentId: '',
  groupSort: 1,
  groupSlot: '',
  groupFailSlot:'',
  isHidden: false,
  showConfig: null,
  groupHeadTips: '',
  groupFootTips: '',
  groupDisplay: '',
  groupTitle: '',
  groupTips: '',
  groupLinkName: '',
  groupLinkType: '',
  groupLinkAddress: ''
})


const open = async (type, data, curSort,index) => {
  curApiIndex.value = index
  dialogVisible.value = true
  bizType.value = type
  activeTab.value = 'basic'
  console.log(index,'templateApiList-----', props.templateApiList)
  if (type === 'update') {
    groupForm.value = {
      ...data,
      groupDisplay: data.groupDisplay || '',
      groupTitle: data.groupTitle || ''
    }
    title.value = '编辑分组'
  } else {
    groupForm.value = {
      groupCode: generateUniqueId(),
      groupName: '',
      parentId: '',
      groupSort: curSort || 1,
      groupSlot: '',
      groupFailSlot:'',
      isHidden: false,
      showConfig: null,
      groupHeadTips: '',
      groupFootTips: '',
      groupDisplay: '',
      groupTitle: '',
      groupTips: '',
      groupLinkName: '',
      groupLinkType: '',
      groupLinkAddress: ''
    }
    title.value = '添加分组'
  }
}

const generateUniqueId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return `group-${timestamp}-${random}`
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入分组编码'))
  } else if (props.groupList.find((group) => group.groupCode === value)) {
    callback(new Error('分组编码不能重复'))
  } else {
    callback()
  }
}

const rules = reactive({
  groupCode: [{ required: true, validator: validatePass, trigger: 'blur' }],
  groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
})

const emit = defineEmits(['success'])
// 根据groupCode查找分组
const findGroupByCode = (groups, targetCode) => {
  for (const group of groups) {
    if (group.groupCode === targetCode) {
      return group;
    }
    if (group.children?.length) {
      const found = findGroupByCode(group.children, targetCode);
      if (found) return found;
    }
  }
  return null;
}
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      dialogVisible.value = false
      groupForm.value.groupSort = String(groupForm.value.groupSort)
      groupForm.value.groupSlot = groupForm.value.groupSlot || ''
      groupForm.value.groupFailSlot = groupForm.value.groupFailSlot || ''
      // 如果选择了父节点，设置正确的parentId
      // if (groupForm.value.parentCode) {
      //   // 在树形数据中查找选中的父分组
      //   const parentGroup = findGroupByCode(props.templateApiList[curApiIndex.value].pageGroupsTree, groupForm.value.parentCode);
      //   if (parentGroup) {
      //     console.log(parentGroup)
      //     groupForm.value.parentId = parentGroup.id; // 使用父分组的id作为parentId
      //   }
      // }
      console.log(groupForm.value)
      emit('success', cloneDeep(groupForm.value), bizType.value)
    }
  })
}

const tipsDialogVisible = ref(false)
const groupTips = ref('')
const tipsType = ref('head') 
const openDialog = (type,tips) => {
  tipsType.value = type
  groupTips.value = tips
  tipsDialogVisible.value = true
}
const saveTips = () => {
  if(tipsType.value === 'head'){
    groupForm.value.groupHeadTips = groupTips.value
  }else{
    groupForm.value.groupFootTips = groupTips.value
  }
  groupTips.value = ''
  tipsDialogVisible.value = false
}
const clearTips = (type) => {
  groupForm.value[type] = ''
}
defineExpose({ open })

onMounted(() => {})
</script>

<style lang="scss" scoped>
.dialog-content {
  height: 500px;
  overflow-y: auto;

  .basic-fields {
  }

  .config-tabs {
  }
}
.dialog-content-tips {
  height: 400px;
  overflow-y: auto;

  .basic-fields {
  }

  .config-tabs {
  }
}

.show-config-item {
  :deep(.el-form-item__label) {
    height: 52px;
    line-height: 52px;
  }
}

.dialog-footer {
  padding: 20px 0 0;
  text-align: right;
}
</style>
