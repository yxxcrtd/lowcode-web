<template>
  <div class="header_info">
    <div class="left_btn">
      <span class="left-btn-icon">{{ getFirstName }}</span>
    </div>
    <div class="content_info">
      <div class="content_title">
        {{ formTitle }}
        <span v-if="isRead" class="formover">已完成</span>
        <span v-else class="formwaitsubmit">待提交</span>
      </div>
      <div class="sub_title">
        <span>申请人：</span>
        <span class="sub_info">{{ flowData.name }}</span>
        <span>所属部门：</span>
        <span class="sub_info">{{ flowData.dept }}</span>
        <span>流程最新一次更新时间：</span>
        <span class="sub_info">{{ flowData.lastUpdateDate }}</span>
        <span>流程版本：</span>
        <span class="sub_info">{{ flowData.version }}</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'FormHeader',
  props: {
    formTitle: {
      type: String,
      default:'审批流程'
    }
  },
  data() {
    return {
      flowData: {
        name: '张三',
        dept: '合规审查',
        lastUpdateDate: '2024-11-25',
        version: 'v2.0'
      }
    }
  },
  created() {
  },
  computed: {
    isRead() {
      return this.$route.query.type === 'read'
    },
    getFirstName() {
      if (this.flowData.name) {
        return this.flowData.name.slice(0, 1)
      }
      return ''
    }
  },
  methods: {
  }
}
</script>
<style scoped lang="scss">
.header_info {
  // position: fixed;
  z-index: 3;
  // left: 220px;
  top: 40px;
  // width: calc(100% - 222px);
  height: 80px;
  //   background-image: url('~@/assets/stakeholder-bg.png');
  background: linear-gradient(180deg, rgba(172, 124, 80, 0.2) 0%, rgba(198, 163, 80, 0.1) 100%);
  background-size: 100% 100%;
  margin-bottom: 10px;
  display: flex;
  .left_btn {
    height: 80px;
    width: 70px;
    color: #666;
    display: flex;
    justify-content: center;
    align-items: center;
    .left-btn-icon {
      background-color: #e4d6b0;
      height: 40px;
      width: 40px;
      border-radius: 50%;
      color: #fff;
      display: flex;
      font-size: 16px;
      font-weight: 600;
      justify-content: center;
      align-items: center;
    }
  }
  .content_info {
    margin: 16px 24px;
    flex: 1;
    .content_title {
      color: #333;
      font-weight: bold;
      font-size: 16px;
      .formwaitsubmit {
        background: #B38E33;
        border-radius: 20px;
        font-size: 12px;
        color: #ffffff;
        font-weight: normal;
        padding: 4px 8px;
        margin-left: 10px;
      }
      .formover {
        background: #B38E33;
        border-radius: 20px;
        font-size: 12px;
        color: #ffffff;
        font-weight: normal;
        padding: 4px 8px;
        margin-left: 10px;
      }
    }
    .sub_title {
      color: #999;
      font-size: 12px;
      margin-top: 4px;
      .sub_info {
        color: #666;
        margin-right: 80px;
      }
    }
  }
  .active_item_btn {
    width: 80px;
    height: 28px;
    border-radius: 2px;
    background: #00b02f !important;
    color: #ffffff !important;
    margin: 24px;
  }
}
</style>
