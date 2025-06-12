<script setup lang="ts">
import type {btnDropItem} from '../baseUseType'
import {reactive,ref} from 'vue'
withDefaults(defineProps<{
  isShowArrow?: boolean,
  btnDropList?:Array<btnDropItem>,
  searchName?:string,
}>(), {
  isShowArrow: false,
  btnDropList: ()=>[{prop:'1',text:'测试1'},{prop:'2',text:'测试2'}],
  searchName:'名称'
})
const handleQuery = ()=>true
const form = reactive({
  name:'',
  region:'',
  radio:'',
})
const addDataSourceFlag = ref(false)
const addDataSource = ()=>{
  addDataSourceFlag.value = true
}
</script>

<template>
  <div class="header ">
    <div class="right search-content">
      <div class="input">
        <span>{{searchName}}</span><el-input/>
      </div>
      <div class="right-btn">
        <el-button @click="handleQuery" type="primary">
          <Icon class="mr-5px" icon="ep:download"/>
          查询
        </el-button>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:upload"/>
          重置
        </el-button>
      </div>
    </div>
    <div class="left">
      <el-dropdown>
        <el-button type="primary" @click="addDataSource">
          新增<Icon v-if="isShowArrow" class="mr-5px" icon="ep:arrow-down"/>
        </el-button>
        <template #dropdown v-if="isShowArrow">
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in btnDropList" :key="item.prop">{{ item.text }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button @click="handleQuery">
<!--        <el-icon><Delete /></el-icon>-->
        <Icon class="mr-5px" icon="ep:delete"/>
        删除
      </el-button>
      <el-button @click="handleQuery">
        <Icon class="mr-5px" icon="ep:download"/>
        导入
      </el-button>
      <el-button @click="handleQuery">
        <Icon class="mr-5px" icon="ep:upload"/>
        导出
      </el-button>
    </div>
    <el-dialog v-model="addDataSourceFlag" title="" width="1100">
      <el-form :model="form">
        <el-row>
          <el-col :span="12">
            <el-form-item label="类型" label-width="100">
              <el-select v-model="form.region" placeholder="Please select a zone">
                <el-option label="Zone No.1" value="shanghai" />
                <el-option label="Zone No.2" value="beijing" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="动态数据源" label-width="100">
              <el-radio-group v-model="form.radio">
                <el-radio value="Value 1">Option 1</el-radio>
                <el-radio label="Label 2 & Value 2">Option 2</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据源编码" label-width="100">
              <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据源名称" label-width="100">
              <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="JDBC URl" label-width="100">
              <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" label-width="100">
              <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" label-width="100">
              <el-input v-model="form.name" type="password" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" label-width="100">
              <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDataSourceFlag = false">Cancel</el-button>
          <el-button type="primary" @click="addDataSourceFlag = false">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
  .header{
   /* display: flex;
    justify-content: space-between;
    height: 80px;*/
    .mr-5px{
      margin-left: 5px;
    }
    .el-dropdown{
      margin-right: 12px;
      //background-color: #3b3e55;
    }
    .el-button{
      width: 86px;
      &:hover{
        outline: none;
      }
    }
    .left{
      padding-bottom: 15px;
    }
    .right{
      display: flex;
      align-items: center;
      padding: 10px 0 20px 30px ;
      .input{
        display: flex;
        align-items: center;
        width: 400px;
        padding-right: 20px;
        span{
          min-width: 50px;
        }
      }
    }
  }
</style>
