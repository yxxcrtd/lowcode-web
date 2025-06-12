import { store } from '@/store'
import { defineStore } from 'pinia'
import { getAccessToken, removeToken } from '@/utils/auth'
import { CACHE_KEY, useCache, deleteUserCache } from '@/hooks/web/useCache'
import {autoLoginByUserName, getInfo, loginOut} from '@/web-sys/api/login'
import * as authUtil from "@/utils/auth";

const { wsCache } = useCache()

interface UserVO {
  id: number
  avatar: string
  nickname: string
  workNo:string
  deptId: number,
  username:string
}

interface UserInfoVO {
  // USER 缓存
  permissions: string[]
  roles: string[]
  isSetUser: boolean
  user: UserVO,
  businessUserInfo:any
}

export const useUserStore = defineStore('admin-user', {
  state: (): UserInfoVO => ({
    permissions: [],
    roles: [],
    isSetUser: false,
    user: {
      id: 0,
      avatar: '',
      nickname: '',
      workNo:'',
      deptId: 0,
      username:''
    },
    businessUserInfo:{
      userId:0,
      userName:'',
      realName:'',
      workNo:'',
      departId:0,
      departName:''
    }
  }),
  getters: {
    getPermissions(): string[] {
      return this.permissions
    },
    getRoles(): string[] {
      return this.roles
    },
    getIsSetUser(): boolean {
      return this.isSetUser
    },
    getUser(): UserVO {
      return this.user
    },
    getBusinessUser():any{
      return this.businessUserInfo
    }
  },
  actions: {
    async setUserInfoAction(moduleType:number) {
      if (!getAccessToken()) {
        this.resetState()
        return null
      }
      const userInfo = await getInfo(moduleType)
     /* if (!userInfo) {
        userInfo = await getInfo()
      }*/
      this.permissions = userInfo.permissions
      this.roles = userInfo.roles
      this.user = userInfo.user
      this.isSetUser = true
      wsCache.set(CACHE_KEY.USER, userInfo)
      wsCache.set(CACHE_KEY.ROLE_ROUTERS, userInfo.menus)
    },
    async setUserAvatarAction(avatar: string) {
      const userInfo = wsCache.get(CACHE_KEY.USER)
      // NOTE: 是否需要像`setUserInfoAction`一样判断`userInfo != null`
      this.user.avatar = avatar
      userInfo.user.avatar = avatar
      wsCache.set(CACHE_KEY.USER, userInfo)
    },
    async setUserNicknameAction(nickname: string) {
      const userInfo = wsCache.get(CACHE_KEY.USER)
      // NOTE: 是否需要像`setUserInfoAction`一样判断`userInfo != null`
      this.user.nickname = nickname
      userInfo.user.nickname = nickname
      wsCache.set(CACHE_KEY.USER, userInfo)
    },
    async autoLoginByUserName(userName: any){
      const res = await autoLoginByUserName(userName)
      if(res){
        this.businessUserInfo.userId=res.userId
        this.businessUserInfo.userName=res.userName
        this.businessUserInfo.realName=res.realName || res.userName
        this.businessUserInfo.workNo=res.workNo
        this.businessUserInfo.departId=res.departId
        this.businessUserInfo.departName=res.departName
        authUtil.setToken(res)
        return true
      }
      return false
    },
    async loginOut() {
      await loginOut()
      removeToken()
      deleteUserCache() // 删除用户缓存
      this.resetState()
    },
    resetState() {
      this.permissions = []
      this.roles = []
      this.isSetUser = false
      this.user = {
        id: 0,
        avatar: '',
        nickname: '',
        workNo:'',
        deptId: 0
      }
    },
    getBusinessUserInfo(){
      const userInfoCache=window.localStorage.getItem('pro__Login_Userinfo')
      if(userInfoCache){
        const userInfo=JSON.parse(userInfoCache)
        return userInfo.value
      }else{
        return null
      }
    }
  }
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
