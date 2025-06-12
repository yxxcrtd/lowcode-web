import router from '@/web-sys/router'
import {useTagsViewStore} from "@/store/modules/tagsView";

export function loadEventBusOn() {
  window.$wujie.bus.$on(`platform-mainapp-route-change`, (route) => {
    console.log('route-change', route)
    router.push(route).catch((err) => {
      console.log(err)
    })
  })
  window.$wujie.bus.$on(`close-page`, (path) => {
    console.log('close-page', path,router.currentRoute)
    const tagsViewStore = useTagsViewStore()
    //关闭当前选中的tag
    tagsViewStore.delView(router.currentRoute.value)
    router.push("/index")
  })
}
