<template>
  <ace-select v-model="selVal" :data-source="dataSourceList"></ace-select>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import {getRolePage} from "@/api/system/role";
import {getUserListByIds} from "@/api/system/user";

// ==================== Props 定义 ====================
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [Array, String, Number],
    default: undefined
  },
  formData:{
    type: Object
  },
  // 是否多选模式
  formGroups: {
    type: Array
  },
})

// ==================== Emits 定义 ====================
const emit = defineEmits(['update:modelValue', 'change'])

// ==================== 计算属性 ====================
/**
 * 内部值处理,用于v-model双向绑定
 */
const selVal = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

const columnNames=['XTCPGXR_DYXTJL','XTCPGXR_DEXTJL']
let watchFields={}
const watchFieldValue=ref('')
const getWatchFields=()=>{
  let watchFormItems=[]
  props.formGroups.forEach(groupItem=>{
    watchFormItems=watchFormItems.concat(groupItem.formItems.filter(item=>columnNames.includes(item.columnName)))
  })
  watchFormItems.forEach(formItem=>{
    watchFields[formItem.columnName] = formItem.moduleTableId+'.'+formItem.field
  })
}
getWatchFields()

const dataSourceList=ref([])
const getUserList=async ()=>{
  //加载用户
  const res=await getUserListByIds(watchFieldValue.value)
  dataSourceList.value=res.map(item=>{
    return {
      label:item.realname,
      value:item.id,
      ...item
    }
  })
}
const getValueByPath=(obj, path)=> {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}
//监听表单对象，收集字段
watch(
  props.formData,
  (val)=>{
    watchFieldValue.value=''
    Object.keys(watchFields).forEach(key=>{
      const fieldValue=getValueByPath(props.formData,watchFields[key])
      if(fieldValue){
        watchFieldValue.value=watchFieldValue.value+fieldValue+','
      }
    })
    console.log('watchFieldValue',watchFieldValue.value)
  }
)
//监听字段数据，数据变动，查询用户信息
watch(
  watchFieldValue,
  (val)=>{
    getUserList()
  }
)
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
