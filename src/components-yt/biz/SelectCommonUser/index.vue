<template>
  <ace-select v-model="selUserId" :data-source="dataSourceList" :multiple="multiple">
    <template #default="{option}">
      <div class="list-option">
        <span>{{option.label}}</span>
        <span>{{option.departmentName}}</span>
      </div>
    </template>
  </ace-select>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { getUserListByIds } from '@/api/system/user/index'
import {getRoleUser} from "@/components-yt/biz/SelectRoleUser/api";
import {isArray, isString} from "@/utils/is";

// ==================== Props 定义 ====================
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [Array, String, Number],
    default: undefined
  },
  //指定用户id
  userIds:{
    type: [Array, String, Number],
    default:()=>[]
  },
  roleId:{
    type: [Array, String, Number]
  },
  // 是否多选模式
  multiple: {
    type: Boolean,
    default: false
  },
})

// ==================== Emits 定义 ====================
const emit = defineEmits(['update:modelValue', 'change'])

// ==================== 计算属性 ====================
/**
 * 内部值处理,用于v-model双向绑定
 */
const selUserId = computed({
  get() {
    if(props.multiple && isString(props.modelValue)) {
      return props.modelValue && props.modelValue.split(',')
    }else{
      return props.modelValue
    }
  },
  set(val) {
    emit('update:modelValue', val)
    emit('change', val)
  }
})
const dataSourceList=ref([])
const getUserList=async ()=>{
  let userList=[]
  //根据指定用户id加载用户
  if(props.userIds){
    const userIds=props.userIds
    const res=await getUserListByIds(userIds)
    userList=res.map(item=>{
      return {
        label:item.realname,
        value:item.id+'',
        ...item
      }
    })
  }
  //根据角色id加载用户
  else if(props.roleId){
    const params={
      pageNo: 1,
      pageSize: 10,
      roleId:props.roleId
    }
    const res=await getRoleUser(params)
    userList=res.list.map(item=>{
      return {
        label:item.nickname,
        value:item.id+'',
        ...item
      }
    })
  }
  dataSourceList.value=userList
}

getUserList()
</script>

<style lang="scss" scoped>
// ================ 基础样式 ================
.ace-select-wrapper {
  width: 100%;
  display: inline-block;
}
.list-option{
  display:flex;
  justify-content: space-between;
  align-items: center;
  &>span:nth-child(2){
    font-size: 12px;
    color:#918f8f;
  }
}

</style>
