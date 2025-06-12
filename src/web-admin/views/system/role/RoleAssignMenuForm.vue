<template>
  <el-form ref="formRef" :model="formData" label-width="80px">
    <el-form-item label="角色名称">
      <el-tag>{{ formData.name }}</el-tag>
    </el-form-item>
    <el-form-item label="角色标识">
      <el-tag>{{ formData.code }}</el-tag>
    </el-form-item>
    <el-form-item label="菜单权限">
      <div class="menu-table-content">
        <vxe-table border height="auto" :tree-config="treeConfig" :data="tableData">
          <vxe-column field="name" title="菜单名称" min-width="220" tree-node></vxe-column>
          <vxe-column field="name" title="纯菜单" min-width="220">
            <template #default="{ row }">
              <div class="role-table-checkbox" v-if="[1, 2].includes(row.type)">
                <vxe-checkbox-group v-model="row.checkedMenuList" :option-props="{ value: 'id', label: 'name' }"
                                    :options="(row.children || []).filter(ch => ch.type === 2 && (!ch.children || ch.children?.length === 0))"
                                    @change="handleMenu(row)"></vxe-checkbox-group>
              </div>
            </template>
          </vxe-column>
          <vxe-column field="size" title="菜单按钮" min-width="240">
            <template #default="{ row }">
              <div class="role-table-checkbox" v-if="row.type === 2 && row.childrenBtns.length === 0">
                <vxe-checkbox-group v-model="row.checkedBtnList" :option-props="{ value: 'id', label: 'name' }"
                                    :options="row.children" @change="handleBtn(row)"></vxe-checkbox-group>
              </div>
            </template>
          </vxe-column>
          <vxe-column field="operate" title="操作" width="180">
            <template #default="{ row }">
              <div class="role-table-checkbox"
                   v-if="(row.children && row.childrenBtns.length === 0) || ([1, 2].includes(row.type) && (row.children || []).filter(ch => ch.type === 2 && (!ch.children || ch.children?.length === 0)).length > 0)">
                <vxe-checkbox-group v-model="row.checkedAll" :options="allOptions"
                                    @change="toggleSelectAll(row)"></vxe-checkbox-group>
              </div>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </el-form-item>
    <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
    <el-button @click="resetData">重 置</el-button>
  </el-form>
</template>
<script lang="ts" setup>
import { handleTree } from '@/utils/tree'
import * as MenuApi from '@/api/system/menu'
import * as PermissionApi from '@/api/system/permission'

defineOptions({ name: 'SystemRoleAssignMenuForm' })


const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const formData = reactive({
  id: undefined,
  name: '',
  code: '',
  menuIds: []
})
const formLoading = ref(false) // 表单加载状态
const formRef = ref() // 表单 Ref
/**
 * @param arr 判断是不是一个有效的数组
 */
 function isValidArray(arr) {
  if (!Array.isArray(arr)) return false
  if (arr && arr.length > 0) {
    return true
  }
  return false
}
/**
 * @param {*} treeData 处理树形数据
 * @desc 把除了按钮的菜单 children赋值给childrenBtns
 */

function parseBtns(treeData) {
  for (let i = 0; i < treeData.length; i++) {
    let item = treeData[i]
    item.childrenBtns = []
    if (isValidArray(item.children)) {
      if (item.children.some((child) => isValidArray(child.children))) {
        item.childrenBtns = item.children
      }
      parseBtns(item.children)
    }
  }
  return treeData
}

/**
 * 设置反显的状态
 * @param treeData 
 * @param menuIds 
 */
function setTreeData(treeData, menuIds) {
  for (let i = 0; i < treeData.length; i++) {
    let item = treeData[i]
    if (isValidArray(item.children) && !isValidArray(item.childrenBtns)) {
      // 设置按钮选中
      item.checkedBtnList = item.children.filter(child => menuIds.includes(child.id)).map(ch => ch.id)
      if (item.checkedBtnList.length === item.children.length) {
        item.checkedAll = ['1']
      }
    }
    if (item.type === 1) {
      // 设置孤立菜单选中
      item.checkedMenuList = (item.children || []).filter(child => {
        let flag1 = child.type === 2 && (child.children || []).length === 0
        let flag2 = menuIds.includes(child.id)
        return flag1 && flag2
      }).map(ch => ch.id)
      if (item.checkedMenuList.length === (item.children || []).filter(ch => ch.type === 2 && (!ch.children || ch.children?.length === 0)).length) {
        item.checkedAll = ['1']
      }
    }
    if (isValidArray(item.children)) {
      setTreeData(item.children, menuIds)
    }
  }
}
/**
 * 递归查询树形机构的父节点
 * @param tree 树形数据
 * @param targetId 目标的id，根据id查询会更准确
 * @param parents 结果数组
 */
function findParents(tree, targetId, parents = []) {
  for (let node of tree) {
    if (node.id === targetId) {
      return parents.concat(node.id);
    }
    if (node.children) {
      let res = findParents(node.children, targetId, parents.concat(node.id));
      if (res) {
        return res;
      }
    }
  }
  return null;
}
/**
 * 递归查询所有选中的节点（包括按钮节点和孤立菜单节点）
 * @param treeData 
 */
function findAllChekedNodes(treeData) {
  let res: any = []
  function findNodeId(treeData) {
    for (let i = 0; i < treeData.length; i++) {
      let item = treeData[i]
      // 菜单按钮
      if (isValidArray(item.checkedBtnList)) {
        res.push(...(item.checkedBtnList || []))
      }
      // 孤立菜单
      if (isValidArray(item.checkedMenuList)) {
        res.push(...(item.checkedMenuList || []))
      }
      if (isValidArray(item.children)) {
        findNodeId(item.children)
      }
    }
  }
  findNodeId(treeData)
  // 数据去重
  return Array.from(new Set(res))
}
/**
 * 重新组装提交的数据-包含选中按钮的对应的父节点以及这条线的各节点
 * @param treeData 
 */
const generateParams = (treeData) => {
  // 找出所有选中的按钮
  let allBtns = findAllChekedNodes(treeData)
  let res: any = []
  allBtns.forEach(item => {
    res = [...findParents(treeData, item, []), ...res]
  })
  return Array.from(new Set([...allBtns, ...res]))
}
/**
 * 菜单的选择事件
 * @param row 当前行的数据
 */
const handleMenu = row => {
  if (row.checkedMenuList.length === (row.children || []).filter(ch => ch.type === 2 && (!ch.children || ch.children?.length === 0)).length) {
    row.checkedAll = ['1']
  } else {
    row.checkedAll = []
  }
}
/**
 * 菜单按钮的选择事件
 * @param row 当前行的数据
 */
const handleBtn = row => {
  if (row.checkedBtnList.length === row.children.length) {
    row.checkedAll = ['1']
  } else {
    row.checkedAll = []
  }
}
/**
 * 操作列的全选按钮
 * @param row 
 */
const toggleSelectAll = row => {
  if (row.checkedAll.length === 1) {
    row.checkedBtnList = row.children.map(item => item.id)
    row.checkedMenuList = (row.children || []).filter(ch => ch.type === 2 && (!ch.children || ch.children?.length === 0)).map(item => item.id)
  } else {
    row.checkedBtnList = []
    row.checkedMenuList = []
  }
}
const treeConfig = ref({
  // transform: true,
  rowField: 'id',
  parentField: 'parentId',
  childrenField: 'childrenBtns',
  iconOpen: 'vxe-icon-square-minus',
  iconClose: 'vxe-icon-square-plus'
})
let tableData = ref([])

const allOptions = ref([
  {
    label: '全选',
    value: '1'
  }
])
const resetForm = () => {
  // 重置选项
  formRef.value?.resetFields()
}

const resetData = () => {
  handleSelect(formData.id, formData.name, formData.code)
}

const handleSelect = async (roleId, roleName, roleCode) => {
  if (roleId) {
    resetForm()
    formData.id = roleId
    formData.name = roleName
    formData.code = roleCode
    // 加载 Menu 列表。注意，必须放在前面，不然下面 setChecked 没数据节点
    let menuList = await MenuApi.getSimpleMenusList()
    let adminMenu = menuList.filter((item) => item.moduleType === 0)
    let sysMenu = menuList.filter((item) => item.moduleType === 1)
    sysMenu.forEach((item) => {
      if (item.parentId === 0) {
        item.parentId = -1
      }
    })
    const rootNode = [
      {
        id: 0,
        name: '管理后台',
        parentId: -2,
        type: 2
      },
      {
        id: -1,
        name: '中台',
        parentId: -2,
        type: 2
      }
    ]
    // DIR(1)，//日录
    // MENU(2)，//菜单
    // BUTTON(3)// 按钮
    menuList = [...rootNode, ...adminMenu, ...sysMenu]
    tableData.value = parseBtns(handleTree(menuList))
    formLoading.value = true
    try {
      formData.menuIds = await PermissionApi.getRoleMenuList(roleId)
      // 设置选中
      setTreeData(tableData.value, formData.menuIds)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ handleSelect })

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    interface DataIns {
      roleId: String | any,
      menuIds: Array<any>
    }
    const data: DataIns = {
      roleId: formData.id,
      menuIds: generateParams(tableData.value)
    }
    await PermissionApi.assignRoleMenu(data)
    message.success(t('common.updateSuccess'))
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
<style lang="scss" scoped>
.cardHeight {
  width: 100%;
  // max-height: 600px;
  max-height: 420px;
  overflow-y: scroll;
}

:deep(.role-table-checkbox) {
  .vxe-checkbox-group {
    .vxe-checkbox {
      margin-top: 5px;
      margin-bottom: 5px;
      margin-left: 10px;
    }
  }
}
.menu-table-content{
  height: calc(100vh - 310px);
  width: 100%
}
</style>
