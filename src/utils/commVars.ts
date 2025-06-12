import dayjs from "dayjs";
import {useUserStore} from "@/store/modules/user";

const varMap={
  'curDate':()=>{
    return dayjs().format('YYYY-MM-DD HH:mm:ss')
  },
  'curUserName':()=>{
    const userStore = useUserStore()
    return userStore.user.nickname
  },
  'curUserId':()=>{
    const userStore = useUserStore()
    return userStore.user.id
  },
  'curUserDeptId':()=>{
    const userStore = useUserStore()
    return userStore.user.deptId
  }
}
export function getCommonVar(name: string): string {
  return varMap[name] ? varMap[name]() : ''
}
