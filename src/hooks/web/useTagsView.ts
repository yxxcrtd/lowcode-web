import { useTagsViewStoreWithOut } from '@/store/modules/tagsView'
import { RouteLocationNormalizedLoaded, useRouter } from 'vue-router'
import { computed, nextTick, unref } from 'vue'

export const useTagsView = () => {
  const tagsViewStore = useTagsViewStoreWithOut()

  const { replace, push,currentRoute } = useRouter()

  const selectedTag = computed(() => tagsViewStore.getSelectedTag)

  const closeAll = (callback?: Fn) => {
    tagsViewStore.delAllViews()
    callback?.()
  }

  const closeLeft = (callback?: Fn) => {
    tagsViewStore.delLeftViews(unref(selectedTag) as RouteLocationNormalizedLoaded)
    callback?.()
  }

  const closeRight = (callback?: Fn) => {
    tagsViewStore.delRightViews(unref(selectedTag) as RouteLocationNormalizedLoaded)
    callback?.()
  }

  const closeOther = (callback?: Fn) => {
    tagsViewStore.delOthersViews(unref(selectedTag) as RouteLocationNormalizedLoaded)
    callback?.()
  }
  
  const closeView=(path,toView,callback?: Fn) => {
    if (currentRoute?.meta?.affix) return
    let curRouteIndex=-1;
    let curView=currentRoute
    if(path){
      curRouteIndex=tagsViewStore.visitedViews.findIndex(item=>item.path===currentRoute.value.path)
      curView=tagsViewStore.visitedViews.find(item=>item.path===currentRoute.value.path)
    }else{
      curRouteIndex=tagsViewStore.visitedViews.findIndex(item=>item.name===currentRoute.value.name)
    }
    tagsViewStore.delView(unref(curView))
    nextTick(()=>{
      if(toView){
        push(toView)
      }else{
        if(curRouteIndex>0){
          push(tagsViewStore.visitedViews[curRouteIndex-1])
        }
      }
    })
  }

  const closeCurrent = async (toView?: RouteLocationNormalizedLoaded) => {
    if (currentRoute?.meta?.affix) return
    const curRouteIndex:number=tagsViewStore.visitedViews.findIndex(item=>item.name===currentRoute.value.name)
    tagsViewStore.delView(unref(currentRoute))
    await nextTick()
    if(toView){
      push(toView)
    }else{
      if(curRouteIndex>0){
        push(tagsViewStore.visitedViews[curRouteIndex-1])
      }
    }
    //如果是微前端，关闭自身时，调用父应用关闭方法
    const wujieProps = window.$wujie?.props
    if(wujieProps && wujieProps.closePage){
      wujieProps.closePage()
    }
  }

  const refreshPage = async (view?: RouteLocationNormalizedLoaded, callback?: Fn) => {
    tagsViewStore.delCachedView()
    const { path, query } = view || unref(currentRoute)
    await nextTick()
    replace({
      path: '/redirect' + path,
      query: query
    })
    callback?.()
  }

  const setTitle = (title: string, fullPath?: string) => {
    tagsViewStore.setTitle(title, fullPath)
  }

  return {
    closeAll,
    closeLeft,
    closeRight,
    closeOther,
    closeView,
    closeCurrent,
    refreshPage,
    setTitle
  }
}
