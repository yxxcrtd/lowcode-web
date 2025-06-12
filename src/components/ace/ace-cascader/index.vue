<template>
  <div class="content">
    <el-cascader
      v-bind="$attrs"
      clearable
      v-model="curValue"
      :options="options"
      :disabled="disabled"
      :props="isLazyProps"
      @change="handleChange"
    />
  </div>

</template>

<script setup lang="ts">
import request from '@/config/axios'
import type { CascaderProps } from 'element-plus'

// 普通输入框
defineOptions({name: 'AceInputNumber'})

const props = defineProps({
  modelValue: {
    type:[String,Array],
    default:undefined,
  },
  disabled:{
    type:Boolean,
    default:false
  },
  url: {
    type: String,
    default: ''
  },
  dataList: {
    type: Array,
    default: () => []
  },
  fieldList: {
    type: Array<string>,
    default: () => ['value', 'label','children']
  },
  mode: {
    type: String,
    default: 'single'
  },
  lazy:{
    type:Boolean,
    default:false,
  },
  //针对远程请求结果集数据怎么取字段由外面传
  resultFieldList:{
    type:Array,
    default:()=>['data','list']
  }

})
let options = ref<any[]>([])
let isLazyProps = reactive<CascaderProps>({})
//处理数据赋值给当前绑定的值 根据返回要求
const handleChange = (value)=>{
  console.log(value)
}
//加载数据源，数据
const loadList = async () => {
  if(props.lazy){
    isLazyProps = {
      lazy: true,
      async lazyLoad(node, resolve) {
        const { level } = node;
        const nodes:any[] = [];
        // 当他层级是第一层的时候 发送的接口
        if (level == 0) {
          let res: any = await requestList({ url:props.url,current: 1, size: 100 });
          res.data.list.map(item => {
            let obj = {
              valueKey: item.code,
              label: item.name,
              leaf: false
            };
            nodes.push(obj);
          });
          resolve(nodes);
        } else {
          // 判断如果第二层的时候
          if (node?.data?.hasChild == "1") {
            let res: any = await requestList({ url:props.url,current: 1, size: 100, code: node.data.value });
            res.data.list.map(item => {
              let obj = {
                value: item.code,
                label: item.name,
                leaf: false
              };
              nodes.push(obj);
            });
            resolve(nodes);
          } else {
            let res: any = await requestList({ url:props.url,current: 1, size: 100, code: node?.data?.value });
            res.data.list.map(item => {
              let obj = {
                value: item.code,
                label: item.name,
                leaf: true
              };
              nodes.push(obj);
            });
            resolve(nodes);
          }
        }
      }
    }
  }else{
    isLazyProps = {
      lazy: false,
    }
    options.value = props.dataList
  }
  //判断多选
  if(props.mode!=='single'){
    Object.assign(isLazyProps, {multiple:true})
  }
  Object.assign(isLazyProps, {value: valueKey.value, label: labelKey.value, children: childrenKey.value})
}
const requestList = async (param)=>{
 return  await request.post(param)
}
//提取对应的展示信息value label
const valueKey = ref('')
const labelKey = ref('')
const childrenKey = ref('')
//处理数据对应的labelAndValue
const handleLabelAndValue = () => {
  valueKey.value = props.fieldList[0]
  labelKey.value = props.fieldList[1]
  childrenKey.value = props.fieldList[2]
  //加入对数据源处理
  //优先取datalist
  if(props.dataList){
    options.value = props.dataList
    return
  }
  if (props.url) {
    request.get(props.url).then(res => {
      options.value = res.data;
    })
  }
}
const loadInit = async () => {
  handleLabelAndValue()
  await loadList()
}
loadInit()
onMounted(() => {

})
const emit = defineEmits(['update:modelValue'])
let curValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string|any[]) => {
    emit('update:modelValue', val)
  }
})
</script>

<style scoped lang="scss">
:deep(.el-cascader) {
  width: 100%;
}
.content{
  width: 100%;
}
</style>
