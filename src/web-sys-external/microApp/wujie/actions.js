import router from '../../router'
import {useTagsView} from "@/hooks/web/useTagsView";

let lastRoute = {}
export function loadEventBusOn() {
  window.$wujie.bus.$on(`platform-mainapp-route-change`, (route) => {
    console.log('route-change', route)
    if (router.currentRoute.path != route.path) {
      lastRoute = route
      setTimeout(() => {
        router.push(route).catch((err) => {
          console.log(err)
        })
      }, 100)
    }
  })
  window.$wujie.bus.$on(`close-page`, (path) => {
    console.log('close-page', path)
    const tagViews=useTagsView()
    //关闭当前选中的tag
    tagViews.closeView(path)
  })
}
