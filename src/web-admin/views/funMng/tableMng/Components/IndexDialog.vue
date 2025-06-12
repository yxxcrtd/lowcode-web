<template>
  <Dialog :title="title" v-model="dialogVisible" width="600">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
        <el-form-item label="索引名" prop="indexName">
          <el-input v-model="form.indexName"> </el-input>
        </el-form-item>
        <el-form-item label="是否唯一" prop="isQuary">
          <el-switch v-model="form.isUniqueKey" inline-prompt active-text="是" inactive-text="否" />
        </el-form-item>

        <el-form-item label="设置字段">
          <vxe-table border="inner" style="width: 100%" :data="form.fieldList">
            <vxe-column type="seq" title="序号" width="60" align="center">
              <template #default="{ rowIndex }">
                <div class="sort">
                  <span class="sort-number">{{ rowIndex + 1 }}</span>
                  <span class="sort-action">
                    <el-icon @click="addRow(rowIndex)"><CirclePlusFilled /></el-icon>
                    <el-icon @click="delRow(rowIndex)"><RemoveFilled /></el-icon>
                  </span>
                </div>
              </template>
            </vxe-column>
            <vxe-column field="field" title="字段名" minWidth="150">
              <template #default="{ row, rowIndex }">
                <el-form-item :prop="'fieldList[' + rowIndex + '].fieldName'" :rules="rules.fieldName">
                  <el-select v-model="row.fieldName" placeholder="请选择字段" @change="fieldNameChange(row, rowIndex)">
                    <el-option v-for="item in fieldList" :key="item.columnName" :label="item.columnName" :value="item.columnName">
                      <span style="float: left">
                        <el-tag v-if="item.isPrimaryKey" size="small" type="danger">主键</el-tag>
                        {{ item.columnComment }}
                      </span>
                      <span style="float: right; color: var(--el-text-color-secondary); font-size: 12px">
                        {{ item.columnName }}
                      </span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </template>
            </vxe-column>
            <vxe-column field="sort" title="排序" width="150">
              <template #default="{ row }">
                {{ row.sort }}
                <!--                <el-select v-model="row.sort" placeholder="请选择排序">-->
                <!--                  <el-option v-for="item in sortList" :key="item.value" :label="item.label" :value="item.value" />-->
                <!--                </el-select>-->
              </template>
            </vxe-column>
          </vxe-table>
        </el-form-item>
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
import { CirclePlusFilled, RemoveFilled } from '@element-plus/icons-vue'
import { propTypes } from '@/utils/propTypes'
import { getFieldPage, createIndexDefinition, updateIndexDefinition, detailIndexDefinition } from '../api'
import { useSysConfigStore } from '@/store/modules/sysConfig';

defineOptions({ name: 'EditDialog' })
const useSysConfig = useSysConfigStore()
const dataSourceConfig = useSysConfig.getDataSourceConfig
const props = defineProps({
  tableId: propTypes.string,
  indexRules: propTypes.object.def({})
})
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formRef = ref()
const form = ref({
  id: null,
  indexName: '',
  isUniqueKey: false,
  fieldList: [
    {
      fieldName: '',
      sort: 'Asc'
    }
  ]
})
const disabled = ref<boolean>(false)
const title = ref<string>('创建表')
// 索引名校验
const validateIndexName = (_rule: any, value: any, callback: any) => {
  if (!(value && !(value.indexOf(dataSourceConfig.index_name_prefix) === 0 && value.length === dataSourceConfig.index_name_prefix.length)) ) {
    callback(new Error('请输入索引名'))
  } 
  else if(!new RegExp(dataSourceConfig.index_name_rule,'g').test(value)){
    callback(new Error(dataSourceConfig.index_name_rule_tips || `请输入正确的格式`))
  }
  else {
    callback()
  }
}
const rules = reactive({
  indexName: [{ required: true, validator: validateIndexName, trigger: 'blur' }],
  fieldName: [{ required: true, message: '请选择字段名', trigger: ['change', 'blur'] }]
})
const sortList = [
  {
    label: '正序(Asc)',
    value: 'Asc'
  },
  {
    label: '倒序(Desc)',
    value: 'Desc'
  }
]

//获取当前表字段
let fieldList = ref([])

/** 打开弹窗 */
const operate = ref()
const open = async (type: string, id?: number) => {
  operate.value = type
  if (['read', 'update'].includes(type)) {
    getDateil(id)
  }
  if (type === 'read') {
    disabled.value = true
    title.value = '查看索引'
  } else if (type === 'update') {
    title.value = '修改索引'
  } else {
    title.value = '创建索引'
    form.value = {
      id: null,
      indexName: props.indexRules.index_name_prefix + '',
      isUniqueKey: false,
      fieldList: [
        {
          fieldName: '',
          sort: 'Asc'
        }
      ]
    }
  }
  // 每次打开都获取一次
  getFieldPage({ tableId: props.tableId, pageNo: 1, pageSize: 1000 }).then((res) => {
    fieldList.value = res.list || []
    //   fieldList.value =  [{
    //     id:1,
    //     columnName:'aaa'
    //   },{
    //     id:2,
    //     columnName:'bbb'
    //   }]
  })
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

//索引列新增删除
const addRow = (rowIndex) => {
  form.value.fieldList.splice(rowIndex + 1, 0, {
    fieldName: '',
    sort: 'Asc'
  })
}
const delRow = (rowIndex) => {
  form.value.fieldList.splice(rowIndex, 1)
}
// 重复校验
const fieldNameChange = (row, index) => {
  if (form.value.fieldList.find((item, i) => item.fieldName === row.fieldName && i !== index)) {
    row.fieldName = null
    message.warning('字段已存在！')
  }
}

// update｜read获取信息
const getDateil = async (id) => {
  const res = await detailIndexDefinition(id)
  form.value = {
    ...res,
    fieldList: res.indexColumns.split(',').map((item) => ({
      fieldName: item
    }))
  }
}

// 保存
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const params = {
        isUniqueKey: form.value.isUniqueKey,
        indexName: form.value.indexName,
        indexColumns: form.value.fieldList.map((item) => item.fieldName).join(','),
        tableId: props.tableId,
        id: form.value.id
      }
      let res: any
      if (operate.value === 'create') {
        res = await createIndexDefinition(params)
      } else if (operate.value === 'update') {
        res = await updateIndexDefinition(params)
      }
      console.log('resaaa', res)
      if (res) {
        message.success('提交成功！')
        dialogVisible.value = false
        emit('success')
      }
    } else {
      message.error('表单验证失败，请检查输入')
      return false
    }
  })
}
</script>
<style lang="scss" scoped>
.dialog-wrap {
  height: 300px;
}
.sort {
  .sort-number {
    //display: none;
  }
  .sort-action {
    display: none;
    i {
      font-size: 16px;
      cursor: pointer;
      color: #409eff;
      &:nth-child(1) {
        margin-right: 5px;
      }
      &:hover {
        color: #79bbff;
      }
    }
  }
}

:deep(.vxe-body--row) {
  height: 56px;
  &:hover {
    .sort-number {
      display: none;
    }
    .sort-action {
      display: block;
    }
  }
}
</style>
