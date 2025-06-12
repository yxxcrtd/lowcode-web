<template>
  <div class="flow-list">
    <div class="flow-item" v-for="(row,index) in flowList" :key="'flow-item'+index">
      <el-link :icon="Link" @click="toFlowDetail(row)">{{row.flowTitle}}</el-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {openLoginFanWeiOA} from "@/web-sys/api/login";
import { propTypes } from '@/utils/propTypes'
import {Link} from "@element-plus/icons-vue";
import {getFlowList} from "@/comRenderPlugins/biz-ComComponents/SelectFlow/api";
import {ref, watch} from "vue";
import {useUserStore} from "@/store/modules/user";

defineOptions({ name: 'WorkFlowLink' })

const props = defineProps({
  modelValue: propTypes.string.def('')
})
const userStore=useUserStore()
const flowList=ref([])
const emit = defineEmits(['update:modelText','update:modelText', 'change'])

/**
 * 获取已选流程的详情 反显
 * @returns {Promise<void>}
 */
const initFlowDetail=async ()=>{
  if(props.modelValue){
    const param={
      businessId: '',
      processNumber: props.modelValue,
    }
    const flowRes=await getFlowList(param)
    if(flowRes){
      flowList.value=flowRes.map(item=>{
        return {
          ...item,
          flowId:item.instanceId,
          flowTitle:item.instanceTitle,
        }
      })
    }
  }
}
/**
 * 跳转到泛微页面
 * @param row
 */
const toFlowDetail = async (row) => {
    let userName=userStore.getBusinessUser.userName
    if(!userName) {
      const searchParams = new URLSearchParams(location.search)
      userName = searchParams.get('username')
    }
    const tokenRes=await openLoginFanWeiOA(userName)
    const flowUrl=`http://10.0.23.88/common/chatResource/view.html?iswfshare=1&resourceid=${row.flowId}&resourcetype=0&ssoToken=${tokenRes.accessToken}`
    window.open(flowUrl)
  }
  onMounted(()=>{
    initFlowDetail()

    watch(() => props.modelValue, (newVal, oldVal) => {
      if(newVal !== oldVal) {
        initFlowDetail()
      }
    })
  })
</script>
<style lang="scss" scoped>
.flow-list{
}
</style>
