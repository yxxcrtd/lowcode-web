<template>
  <div class="container">
    <el-drawer v-model="dialogVisible" title="按钮权限编辑" direction="rtl" size="50%">
      <div class="content">
        <el-form :model="menuInfo" :rules="rules" ref="formRef" label-width="120">
          <div class="top">
            <el-form-item label="菜单名称:">
              <span>{{menuInfo.name}}</span>
            </el-form-item>
            <el-form-item label="按钮前缀:" prop="prefix">
              <el-input v-model="menuInfo.pageId" />
            </el-form-item>
          </div>
          <div class="middle">
            <div class="button">
              <el-button type="primary" @click="addRecord">新增按钮</el-button>
            </div>
            <div class="table">
              <vxe-table
                border="inner"
                ref="tableRef"
                :data="menuInfo.menuBtnList"
                :row-config="{ isHover: false, height: 58 }"
                :column-config="{ resizable: false }"
              >
                <vxe-column field="name" title="按钮名称" width="120">
                  <template #default="{ row,rowIndex }">
                    <el-form-item label-width="0" :prop="'menuBtnList.'+rowIndex+'.name'" :rules="rules.name">
                      <el-input v-model="row.name" type="text" placeholder="请输入"></el-input>
                    </el-form-item>
                  </template>
                </vxe-column>
                <vxe-column field="permission" title="授权标识">
                  <template #default="{ row,rowIndex }">
                    <el-form-item label-width="0" :prop="'menuBtnList.'+rowIndex+'.permission'" :rules="rules.permission">
                      <el-input v-model="row.permission" type="text" placeholder="请输入"></el-input>
                    </el-form-item>
                  </template>
                </vxe-column>
                <vxe-column field="sort" title="排序" width="100">
                  <template #default="{ row,rowIndex }">
                    <el-form-item label-width="0" :prop="'menuBtnList.'+rowIndex+'.sort'">
                      <el-input v-model="row.sort" type="number" placeholder="请输入"></el-input>
                    </el-form-item>
                  </template>
                </vxe-column>
                <vxe-column field="status" title="状态" width="100">
                  <template #default="{ row,rowIndex }">
                    <el-form-item label-width="0" :prop="'menuBtnList.'+rowIndex+'.status'">
                      <el-select v-model="row.status">
                        <el-option v-for="item in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="item.value" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                  </template>
                </vxe-column>
                <vxe-column title="操作" width="100">
                  <template #default="{ rowIndex }">
                    <el-link type="primary" @click="handleDel(rowIndex)">删除</el-link>
                  </template>
                </vxe-column>
              </vxe-table>
            </div>
            <div class="btn-cont">
              <el-button type="primary" @click="submitForm">确定</el-button>
              <el-button @click="dialogVisible = false">关闭</el-button>
            </div>
          </div>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import {batchAddBtn, createMenu, getModuleMenuList, updateMenu} from "../api";
import {getPageInfo} from "@/web-admin/views/funMng/dev/4-pageDesign/api";
import {DICT_TYPE, getIntDictOptions} from "@/utils/dict";

const message=useMessage()
const dialogVisible = ref(false)
const menuInfo=ref({})
const formRef=ref()

const rules = reactive({
  name: [{ required: true, message: '请输入按钮名称', trigger: 'blur' }],
  permission: [{ required: true, message: '请输入权限', trigger: 'blur' }]
})

const open = (row: any) => {
  dialogVisible.value = true
  menuInfo.value = row
  menuInfo.value.prefix=row.id
  loadMenuBtnList()
}
/**
 * 加载菜单按钮
 */
const loadMenuBtnList=async ()=>{
  const param={
    id:menuInfo.value.id
  }
  const res= await getModuleMenuList(param)
  menuInfo.value.menuBtnList=res
  if(!menuInfo.value.menuBtnList || menuInfo.value.menuBtnList.length==0){
    loadPageInfo()
  }
}
const loadPageInfo=async ()=>{
  const res=await getPageInfo(menuInfo.value.pageId)
  console.log(res)
  menuInfo.value.menuBtnList = res.pageButtons.map((item,index)=>{
    return {
      name: item.buttonName,
      permission: `${menuInfo.value.prefix}:${item.operationType}`,
      moduleType:1,
      parentId:menuInfo.value.id,
      functionId:menuInfo.value.functionId,
      sort: index+1,
      type:3,
      status: 0,
    }
  })
}
/**
 * 删除
 * @param row
 */
const handleDel = async (rowIndex) => {
  menuInfo.value.menuBtnList.splice(rowIndex, 1)
}

const addRecord = () => {
  let obj = {
    name: '',
    permission: `${menuInfo.value.prefix}:`,
    moduleType:1,
    parentId:menuInfo.value.id,
    functionId:menuInfo.value.functionId,
    sort: 1,
    type:3,
    status: 0,
  }
  menuInfo.value.menuBtnList.push(obj)
}

const emit = defineEmits(['success'])
defineExpose({ open })

const submitForm=()=>{
  formRef.value.validate(async (valid) => {
    if (valid) {
      const param= menuInfo.value.menuBtnList.map(item=>{
        return {
          ...item,
          menuId:menuInfo.value.id
        }
      })
      const res = await batchAddBtn(param)
      message.success('提交成功！')
      dialogVisible.value = false
      emit('success')
    } else {
      message.error('表单验证失败，请检查输入')
      return false
    }
  })
}
</script>

<style scoped lang="scss">
.container {
  :deep(.el-drawer .el-drawer__header) {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid #ccc;
  }
  .table{
    :deep(.el-form-item--default){
      margin-bottom: 0 !important;
    }
  }
  .content {
    .top {
      width: 80%;
      margin-bottom: 18px;
    }
    .middle {
      .table {
        width: 100%;
        margin-top: 10px;
        :deep(.vxe-icon-edit:before) {
          content: '';
        }
      }
      .middle-btn {
        width: 100%;
        margin-top: 20px;
        height: 32px;
        line-height: 32px;
        border-radius: 4px;
        text-align: center;
        border: 1px dashed #ccc;
        cursor: pointer;
      }
      .btn-cont {
        margin-top: 20px;
        text-align: left;
      }
    }
  }
}
</style>
