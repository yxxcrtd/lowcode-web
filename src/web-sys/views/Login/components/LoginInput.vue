<template>
  <div class="login-div">
    <span class="login-div-span">{{ props.name }}</span>
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps({
    name: String
})
</script>
<style lang="scss" scoped>
.login-div{
  position: relative;
  text-align: center;
  width: 100%;
  height: 48px;
  vertical-align: middle;
  &-span{
    position: absolute;
    top: -7px;
    left: 10px;
    background: #fff;
    z-index: 999;
    color: #333;
    font-size: 10px;
    line-height: 15px;
    padding: 0 5px;
  }
}
</style>
