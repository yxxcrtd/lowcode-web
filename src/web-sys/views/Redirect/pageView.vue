<template>
  <div class="render-page-container" v-loading="!isLoadPage">
    <template v-if="isLoadPage && isLoadError===0">
      <!-- 列表页和表单页状态为1页面正常展示否则停用 -->
      <template v-if="pageState == '1'">
        <component :is="pageComponent" :pageInfo="pageInfo"></component>
      </template>
      <template v-else>
        <Error type="stopUse"/>
      </template>
    </template>
    <template v-else>
      <el-empty v-if="isLoadError" description="模板错误" />
    </template>
  </div>
</template>
<script lang="ts" setup>
import {getPageInfo} from "./api"
import {getComponentPath} from '@/comRender/utils'

defineOptions({ name: 'PageView' })
const message=useMessage()
const { currentRoute } = useRouter()
const { params, query,meta } = unref(currentRoute)
const pageId=meta.pageId

//获取所有模板组件 只取模板目录下第一层vue组件
let templateModules = import.meta.glob('@/comRender/Template/*/*.vue')
/**
 * 加载页面信息
 */
const pageComponent=ref(null)
const pageInfo=ref({})
const isLoadPage=ref(false)
const pageState=ref('1')
const isLoadError=ref(0)
const loadPageInfo=async ()=>{
  if(!pageId){
    message.error("pageId错误，无法加载页面")
    return;
  }
  const res=await getPageInfo(pageId)
  const componentPath=getComponentPath(res.pageType,res.templateInfo.templateAddress)
  if(!templateModules[componentPath]){
    message.error("模板地址错误:"+componentPath)
    isLoadPage.value=true
    isLoadError.value=404
    return;
  }
  const renderComponent =await templateModules[componentPath]()
  pageComponent.value=renderComponent.default
  await nextTick()
  pageInfo.value=res
  //  获取列表页和表单页状态，1启用0停用
  pageState.value=res.pageState
  isLoadPage.value=true
}
onMounted(async () => {
  loadPageInfo()
})
</script>
<style lang="scss" scoped>
.render-page-container{
  height: calc(100vh - 66px);
}
</style>
