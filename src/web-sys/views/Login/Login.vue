<template>
  <div
    :class="prefixCls"
    class="relative h-[100%] lt-md:px-10px lt-sm:px-10px lt-xl:px-10px lt-xl:px-10px"
  >
    <div :class="`${prefixCls}__bg relative mx-auto h-full flex `">
      <div
        :class="`flex-1 relative p-30px lt-xl:hidden`"
      >
        <!-- 左上角的 logo + 系统标题 -->
        <div class="relative flex items-center text-black">
         <img alt="" class="mr-10px h-48px w-48px" src="@/assets/imgs/logo.png" />
          <span class="text-20px font-bold">{{ underlineToHump(appStore.getTitle) }}</span>
        </div>
        <!-- 左边的背景图 + 欢迎语 -->
        <div class="h-[calc(100%-60px)] flex items-center justify-center pl-100px">
          <TransitionGroup
            appear
            enter-active-class="animate__animated animate__bounceInLeft"
            tag="div"
          >
            <img key="1" alt="" class="w-350px h-300px" src="@/assets/svgs/login-box-bg.svg" />
            <div key="2" class="text-3xl text-black">{{ t('login.welcome') }}</div>
            <div key="3" class="mt-5 text-14px font-normal text-black">
              {{ t('login.message') }}
            </div>
          </TransitionGroup>
        </div>
      </div>
      <div class="relative flex-1 p-30px lt-sm:p-10px">
        <!-- 右上角的主题、语言选择 -->
        <div
          class="flex items-center justify-between text-white at-2xl:justify-end at-xl:justify-end"
        >
        </div>
        <!-- 右边的登录界面 -->
        <Transition appear enter-active-class="animate__animated animate__bounceInRight">
          <div
            class="ml-50px h-full w-[100%] flex items-center at-2xl:max-w-400px at-lg:max-w-500px at-md:max-w-500px at-xl:max-w-500px"
          >
            <!-- 账号登录 -->
            <LoginForm :class="`${prefixCls}__login m-auto h-auto p-30px lt-xl:(rounded-3xl light:bg-white)`" />
            <!-- 手机登录 -->
            <MobileForm class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" />
            <!-- 二维码登录 -->
            <QrCodeForm class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" />
            <!-- 注册 -->
            <RegisterForm class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" />
            <!-- 三方登录 -->
            <SSOLoginVue class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { underlineToHump } from '@/utils'

import { useDesign } from '@/hooks/web/useDesign'
import { useAppStore } from '@/store/modules/app'

import { LoginForm, MobileForm, QrCodeForm, RegisterForm, SSOLoginVue } from './components'

defineOptions({ name: 'Login' })

const { t } = useI18n()
const appStore = useAppStore()
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('login')
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-login;

.#{$prefix-cls} {
  overflow: hidden;
  &__bg {
    background-image: url('@/assets/svgs/login_bg4.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }

  &__left {
    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      background-image: url('@/assets/svgs/login-bg.svg');
      background-position: center;
      background-repeat: no-repeat;
      content: '';
    }
  }

  &__login {
    background-color: #fff;
    border-radius: 4px;
    opacity: 0.9;
  }
}
</style>
