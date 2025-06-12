<template>
  <div style="display: flex;width: 100%;justify-content: space-between;align-items: center;">
  <ace-select-table
    v-model="selValue"
    v-model:show-label="selText"
    :data-url="dataUrl"
    :columns="tableColumns"
    :multiple="multiple"
    query-key-name="query"
    label-key="customerName"
    value-key="customerCode"
    @change="handleChange"
    style="flex: 1;"
  ></ace-select-table>
  <div  style="width: 18px;height: 24px;margin-left: 5px;" @click="toTraderInfo">
    <img src="@/assets/svgs/add-icon.svg">
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

// ==================== Props 定义 ====================
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [Array, String, Number],
    default: undefined
  },
  modelText: {
    type: [Array, String, Number],
    default: undefined
  },
  // 是否多选模式
  multiple: {
    type: Boolean,
    default: false
  }
})

// ==================== Emits 定义 ====================
const emit = defineEmits(['update:modelValue','update:modelText', 'change'])

const tableColumns = [
  {
    field: 'customerName',
    title: '资产端客户名称'
  },
  {
    field: 'customerCode',
    title: '资产端客户编码'
  }
]
const dataUrl = '/ibps/cust/custCustomerMain/queryCustCustomerInfoVoByPage'

// ==================== 计算属性 ====================
/**
 * 内部值处理,用于v-model双向绑定
 */
const selValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
const selText = computed({
  get() {
    return props.modelText
  },
  set(val) {
    emit('update:modelText', val)
  }
})

const router = useRouter() // 路由对象

// 跳转到交易对手页
const toTraderInfo = () => {
  const route = {
    path: '/InstitutionManage/CounterpartyManage',
    query: {
      hasEvent: true,
      eventConfig: JSON.stringify({
          type: 'click',
          target: {
              tag: 'button',
              class: ['pro-action'],
              attr: { name: 'title', value: '新建' }
          },
          once: true
      }) 
    }
  }
  window.$wujie?.bus.$emit("openPage", 'app-platform', route.path,route.query);
}

const handleChange=(val,options)=>{
  emit('change',val,options)
}

</script>

<style lang="scss" scoped>
// ================ 基础样式 ================
.ace-select-wrapper {
  width: 100%;
  display: inline-block;
}
.list-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > span:nth-child(2) {
    font-size: 12px;
    color: #918f8f;
  }
}
</style>
