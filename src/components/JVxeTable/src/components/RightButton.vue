<template>
  <div class="right-btn">
    <template v-if="showRightButton === true || showRightButton.includes('refresh')">
      <el-icon class="table-header-icon" @click="refreshData"><Refresh /></el-icon>
      <el-divider direction="vertical"></el-divider>
    </template>
    <template v-if="(showRightButton === true || showRightButton.includes('columnsort'))&&tableId">
      <ColumnSort :show-search="false" ref="columnsSort" @click="openColumns" :data="oriColumns"
                  @setSessionColumns="setSessionColumns"/>
      <el-divider v-if="isShowExport" direction="vertical"></el-divider>
    </template>
    <template v-if="showRightButton === true || showRightButton.includes('fullscreeen')">
      <el-icon class="table-header-icon" @click="fullScreen"><FullScreen /></el-icon>
    </template>
  </div>
</template>

<script>
  import ColumnSort from './ColumnSort.vue'
  import { ElMessage } from 'element-plus'
  import {Refresh,FullScreen} from '@element-plus/icons-vue'

  export default {
    name: 'RightButton',
    components: {
      ColumnSort,Refresh,FullScreen
    },
    props: {
      tableId: {
        type: String,
        default: ''
      },
      exportUrl: {
        type: String,
        default: ''
      },
      columnUrl: {
        type: String,
        default: ''
      },
      showRightButton: {
        type: [Boolean, Array],
        default: true
      },
      searchParam: {
        type: Object,
        default: () => {}
      },
      domId: {
        type: String,
        default: ''
      },
      isShowExport: {
        type: Boolean,
        default: true
      },
      tableColumns:{
        type: Array,
        default:()=>[]
      },
      fullscreen: {
        type: Boolean,
        default: false
      },
    },
    data() {
      return {
        oriColumns: []
      }
    },
    created() {
      this.getOriColumns()
    },
    methods: {
      openColumns(){
         this.$refs.columnsSort.open()
      },
      async getOriColumns() {
        let resCol = null
        let localColumns = this.getSessionColumns()
        if (!localColumns) {
          let res = {} //await getTableColumnInfo(this.columnUrl)
          if (res) {
            resCol = res.data
          }
        } else {
          resCol = localColumns
        }
        if (resCol) {
          this.oriColumns = JSON.parse(JSON.stringify(resCol))
        }
      },
      refreshData() {
        this.$emit('refreshData')
      },
      async exportData() {
        let res = {} //await getTableColumnInfo(this.columnUrl);
        const param = {
          pageNo: 1,
          pageSize: 99999
        }
        exportExcel(this.exportUrl, {
          data: [],
          params: {
            pageMode: param,
            queryList: [],
            search: '',
            ...this.searchParam
          },
          header: res.data
        })
      },
      setColumn() {},
      fullScreen() {
        console.log('fullscree', this.fullscreen)
        // let element = document.getElementById(this.domId)
        /*if (this.fullscreen) {
          element.parentNode.classList.remove('dom-full-screen')
        } else {
          element.parentNode.className += ' dom-full-screen'
        }*/
        /*if(this.fullscreen){
          //是全屏的话缩小
          this.$emit('exitFullScreen')
        }else{
          this.$emit('fullScreen')
        }*/
          this.$emit('fullScreen')

      },
      /**
       * 获取缓存列头
       */
      getSessionColumns() {
        // 如果缓存取不到就读取当时传进来的
        let result = []
        const copyColumns = JSON.parse(JSON.stringify(this.tableColumns))
        const localTableColumns = window.localStorage && JSON.parse(localStorage.getItem(`${this.tableId}-advancedTableColumns-V2`))
        if (localTableColumns && localTableColumns.length > 0) {
          result = localTableColumns
        } else {
          // 先判断传进来的是否有check /radio
          const firstColumn = copyColumns[0]
          if (firstColumn && firstColumn.type && ['checkbox', 'radio'].includes(firstColumn.type)) {
            copyColumns.shift()
          }
          // 初始化显示
          copyColumns.forEach(item => {
            item.defaultShow = true
          })
          result = copyColumns
        }
        return result
      },
      /**
       * 设置缓存列头
       * isUser: 是否用户修改
       */
      setSessionColumns(data) {
        if (!this.tableId) {
          ElMessage({
            message: '未设置tableId，无法保存列配置',
            type: 'warning',
            plain: true,
          })
          return
        }
        this.oriColumns = JSON.parse(JSON.stringify(data)).filter(item => item.isHide !== 'Y') || []
        window.localStorage && localStorage.setItem(`${this.tableId}-advancedTableColumns-V2`, JSON.stringify(data || []))

        this.$emit('reloadTable', this.oriColumns)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .right-btn {
    display: flex;
    i {
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
    }
  }
</style>
