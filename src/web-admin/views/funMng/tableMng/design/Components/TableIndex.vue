<template>
  <div class="datamodel-header">
    <el-button type="primary" @click="openIndexForm('create')" class="mb-10px"> <Icon icon="ep:plus" /> 新建索引 </el-button>
  </div>
  <el-form>
    <div class="index-list">
      <div class="index-item" v-for="(item,index) in indexDefinitionList" :key="'index-item-'+index">
        <div class="index-item-header">
          <div class="item-title">
            <div class="item-main-title">{{item.indexName}}</div>
            <div class="item-main-update">最近修改:{{dayjs(item.createTime).format('YYYY-MM-DD')}}</div>
          </div>
          <div class="item-action">
            <el-dropdown>
              <el-icon><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="openIndexForm('update',item.id)" >编辑索引</el-dropdown-item>
                  <el-dropdown-item @click="deleteIndexForm(item.id)">删除</el-dropdown-item>
                  <el-dropdown-item divided>修改记录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div class="index-item-content">
          <div class="item-field-list">
            <div class="field-item" v-for="(fieldItem,fieldIndex) in item.indexColumns.split(',')" :key="'field-item-'+fieldIndex">
              <span>{{fieldItem}}</span>
              <!-- <span>{{fieldItem.sort}}</span> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-form>
  <IndexDialog ref="formIndexRef" :table-id="tableId" :index-rules="indexRules" @success="getList"/>
</template>
<script lang="ts" setup>
import { MoreFilled } from '@element-plus/icons-vue'
import IndexDialog from "../../Components/IndexDialog.vue";
// import {apiColumns} from "../../data";
import {propTypes} from "@/utils/propTypes";
import {getIndexDefinitionPage,deleteIndexDefinition, indexDefinition} from "../../api";
import dayjs from 'dayjs'
defineOptions({ name: 'TableIndex' })
const props = defineProps({
  tableId: propTypes.string,
  indexRules: propTypes.object.def({})
})

const message = useMessage() // 消息弹窗
// const currentRow = reactive(null)
const indexData=[
  {
    name:'index1',
    updateUser:'张三',
    updateDate:'2024-09-06',
    list:[
      {
        field:'id',
        fieldName:'id',
        sort:'desc'
      },{
        field:'detailId',
        fieldName:'详情Id',
        sort:'asc'
      },{
        field:'detaifsdfgsdlId',
        fieldName:'详情Id',
        sort:'asc'
      },
    ]
  },
  {
    name:'index1',
    updateUser:'张三',
    updateDate:'2024-09-06',
    list:[
      {
        field:'id',
        fieldName:'id',
        sort:'desc'
      },{
        field:'detailId',
        fieldName:'详情Id',
        sort:'asc'
      },{
        field:'detaifsdfgsdlId',
        fieldName:'详情Id',
        sort:'asc'
      },
    ]
  },
  {
    name:'index1',
    updateUser:'张三',
    updateDate:'2024-09-06',
    list:[
      {
        field:'id',
        fieldName:'id',
        sort:'desc'
      },{
        field:'detailId',
        fieldName:'详情Id',
        sort:'asc'
      },{
        field:'detaifsdfgsdlId',
        fieldName:'详情Id',
        sort:'asc'
      },
    ]
  },
  {
    name:'index1',
    updateUser:'张三',
    updateDate:'2024-09-06',
    list:[
      {
        field:'id',
        fieldName:'id',
        sort:'desc'
      },{
        field:'detailId',
        fieldName:'详情Id',
        sort:'asc'
      },{
        field:'detaifsdfgsdlId',
        fieldName:'详情Id',
        sort:'asc'
      },
    ]
  }
]

/** 添加/修改操作 */
const formIndexRef = ref()
const openIndexForm = (type: string, id?: number) => {
  formIndexRef.value.open(type, id)
}

/** 查询列表 */
const indexDefinitionList = ref<indexDefinition[]>([])
const getList = async () => {
  const indexDefinitionPageRes = await getIndexDefinitionPage({ tableId: props.tableId, pageNo: 1, pageSize: 100 })
  indexDefinitionList.value = indexDefinitionPageRes.list || []
}
// 删除列
const deleteIndexForm = async (id) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await deleteIndexDefinition(id)
    message.success('删除成功')
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
<style lang="scss" scoped>
.datamodel-header {
  display: flex;
  justify-content: start;
  align-items: center;
}
.index-list{
  display: flex;
  flex-wrap: wrap;
  .index-item{
    background:#f5f8ff;
    width: 280px;
    height: 195px;
    border-radius: 10px;
    padding: 10px;
    margin:0 20px 20px 0;
    
    .index-item-header{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #cccccc;
      padding-bottom: 10px;
      .item-title{
        .item-main-title{
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .item-main-update{
          font-size: 12px;
          color: #8b8686;
        }
      }
      .item-action{
        width: 18px;
      }
    }
    .index-item-content{
      margin: 10px 0;
      background: #fff;
      padding: 10px;
      border-radius: 10px;
      .item-field-list{
        .field-item{
          display: flex;
          justify-content: space-between;
          line-height: 23px;
          color: #585757;
          padding: 4px 10px;
          border-bottom: 1px solid #ebe6e6;
        }
      }
    }
  }
}
</style>
