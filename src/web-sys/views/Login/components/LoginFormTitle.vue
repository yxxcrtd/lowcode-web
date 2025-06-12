<template>
  <div>
    <h2 class="enter-x mb-1 text-center text-2xl font-bold xl:text-center xl:text-3xl">
      兆尹低码平台
    </h2>
    <!-- <h3 class="enter-x mb-3 text-center text-l font-bold l:text-center xl:text-xl text-blue" >
      {{ getFormTitle }}
      <span style="border-bottom: 2px solid #60a5fa;">账户登陆</span>
    </h3> -->
  </div>
</template>
<script lang="ts" setup>
import { LoginStateEnum, useLoginState } from './useLogin'

defineOptions({ name: 'LoginFormTitle' })

const { t } = useI18n()

const { getLoginState } = useLoginState()

const getFormTitle = computed(() => {
  const titleObj = {
    [LoginStateEnum.RESET_PASSWORD]: t('sys.login.forgetFormTitle'),
    [LoginStateEnum.LOGIN]: t('sys.login.signInFormTitle'),
    [LoginStateEnum.REGISTER]: t('sys.login.signUpFormTitle'),
    [LoginStateEnum.MOBILE]: t('sys.login.mobileSignInFormTitle'),
    [LoginStateEnum.QR_CODE]: t('sys.login.qrSignInFormTitle'),
    [LoginStateEnum.SSO]: t('sys.login.ssoFormTitle')
  }
  return titleObj[unref(getLoginState)]
})
</script>
