import router from "@/router";
import functions from "@/utils/functions";

let lastRoute={}
export function loadEventBusOn(){
    window.$wujie.bus.$on(`yydd-mainapp-route-change`, (route) => {
        console.log('route-change',route)
        if(router.currentRoute.path!=route.path){
            lastRoute=route
            setTimeout(()=>{
                router.push(route).catch(err=>{console.log(err)})
            },100)
        }
    })
    window.$wujie.bus.$on(`yydd-app-close-page`, (path) => {
        console.log('close-page',path)
        //关闭当前选中的tag
        let currentRoute={
            path:path.split('?')[0]
        }
        functions.closeCurPageByMainApp(currentRoute,()=>{
            console.log('closepage')
        })
    })

}
