<template>
  <Dialog :title="title" v-model="dialogVisible" width="800">
    <div class="dialog-wrap">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120">
        <el-row>
          <el-col :span="12">
            <el-form-item label="上级菜单" prop="parentId">
              <el-tree-select v-model="formData.parentId" :data="menuTree" :default-expanded-keys="[0]" :props="defaultProps" check-strictly node-key="id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group v-model="formData.type">
                <el-radio-button v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_MENU_TYPE)" :key="dict.label" :label="dict.value">
                  {{ dict.label }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.type === 2">
            <el-form-item label="关联页面" prop="pageId">
              <el-select v-model="formData.pageId" @change="handleChangePage">
                <el-option v-for="(item, index) in relevancePageOption" :key="'relevancePage_' + index" :label="item.pageName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单路径" prop="path">
              <template #label>
                <Tooltip
                  message="访问的路由地址，如：`user`。如需外网地址时，则以 `http(s)://` 开头"
                  title="路由地址"
                />
              </template>
              <el-input v-model="formData.path" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.type === 2">
            <el-form-item label="组件地址" prop="component">
              <el-input v-model="formData.component" disabled clearable placeholder="例如说：system/user/index" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单图标">
              <IconSelect v-model="formData.icon" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="formData.sort" :min="0" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio
                  v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                  :key="dict.label"
                  :label="dict.value"
                >
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否隐藏菜单" prop="visible">
              <template #label>
                <Tooltip message="选择隐藏时，路由将不会出现在侧边栏，但仍然可以访问" title="是否隐藏菜单" />
              </template>
              <el-radio-group v-model="formData.visible">
                <el-radio key="true" :label="true">显示</el-radio>
                <el-radio key="false" :label="false">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="缓存路由" prop="keepAlive">
              <template #label>
                <Tooltip message="选择缓存时，则会被 `keep-alive` 缓存" title="缓存路由" />
              </template>
              <el-radio-group v-model="formData.keepAlive">
                <el-radio key="true" :label="true">缓存</el-radio>
                <el-radio key="false" :label="false">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="modelRemark">
              <el-input v-model.number="formData.modelRemark" :rows="2" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { defaultProps, handleTree } from '@/utils/tree'
import AceSelect from '@/components/ace/ace-select/index.vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import {createMenu, getPageInfoPage, getSimpleMenusList, updateMenu} from "../api";
import request from "@/config/axios";

defineOptions({ name: 'MenuEditDialog' })

const route = useRoute()
const moduleId=route.query.id

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const title=ref('创建')
const bizType=ref('create')
const formRef = ref()
const formData = ref({
  visible: true,
  keepAlive: true,
  icon: '',
  sort: undefined,
  parentId: 0,
  name: '',
  modelType: 0,
  path: '',
  pageId:'',
  type: 1,
  modelRemark: null
})
const rules = reactive({
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  parentId: [{ required: true, message: '请选择上一级菜单', trigger: 'blur' }],
  path: [{ required: true, message: '请输入菜单路径', trigger: 'blur' }],
  pageId: [{ required: true, message: '请选择关联页面', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
})
//对数据处理
const menuTree = ref<Tree[]>([]) // 树形结构
const getTree = async (moduleType?: number) => {
  menuTree.value = []
  const res = await getSimpleMenusList(moduleType)
  let menu: Tree = { id: 0, name: '主类目', children: [] }
  menu.children = handleTree(res)
  menuTree.value.push(menu)
}
//查询页面
const relevancePageOption=ref([])
const getPageList = async () => {
  const param={
    menuId:moduleId
  }
  let res = await getPageInfoPage(param)
  relevancePageOption.value = res.list || []
}
const handleChangePage=(val)=>{
  const pageItem=relevancePageOption.value.find(item=>item.id===val)
  if(pageItem){
    formData.value.path=pageItem.pageType==='list' ? `list` : 'form'
  }
}

/** 打开弹窗 */
const open = async (type, data) => {
  if(type==='edit'){
    formData.value=data
    title.value='编辑菜单'
  }else{
    formData.value={
      functionId:moduleId,
      parentId: 0,
      type: 1,
      moduleType: 1,
      status:0,
      component:"/Redirect/pageView",
      visible: true,
      keepAlive: true,
    }
    title.value='创建菜单'
  }
  await getTree(1)
  await getPageList()
  bizType.value=type
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (!isExternal(formData.value.path)) {
        if (formData.value.parentId === 0 && formData.value.path.charAt(0) !== '/') {
          message.error('路径必须以 / 开头')
          return
        } else if (formData.value.parentId !== 0 && formData.value.path.charAt(0) === '/') {
          message.error('路径不能以 / 开头')
          return
        }
      }
      const res=bizType.value==='create' ? await createMenu(formData.value) :await updateMenu(formData.value)
      message.success('提交成功！')
      dialogVisible.value = false
      emit('success')
    } else {
      message.error('表单验证失败，请检查输入')
      return false
    }
  })
}
/** 判断 path 是不是外部的 HTTP 等链接 */
const isExternal = (path: string) => {
  return /^(https?:|mailto:|tel:)/.test(path)
}
</script>
