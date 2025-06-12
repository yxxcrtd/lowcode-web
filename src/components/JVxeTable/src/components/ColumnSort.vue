<template>
  <div>
    <el-icon @click="open" class="table-header-icon"><Setting /></el-icon>
  </div>
  <el-dialog v-model="customColumnPopShow"  :width="586" :manual="true" placement="bottom-end" popper-class="jr-custom-table-column">
<!--    <template #reference>

    </template>-->

    <div ref="columnSort" class="jr-custom-table-column-body">
      <div class="input-search">
        <el-input v-model="query" class="query-panel" placeholder="请输入字段名称" @keyup.enter="handleQuery">
          <template #suffix>
            <i class="iconfont icon-sousuo" @click="handleQuery"></i>
          </template>
        </el-input>
      </div>
      <vxe-table
        style="padding: 5px 0"
        border="inner"
        :height="250"
        :row-config="{ useKey: true, keyField: 'rowkey' }"
        :data="columns"
      >
        <vxe-column title="序号" width="80" align="center">
          <template #default="{ rowIndex }">
            {{ rowIndex + 1 }}
          </template>
        </vxe-column>
        <vxe-column align="left" title="字段名称">
          <template #default="{ row, rowIndex }">
            <div class="field-set">
              {{ row.title || row.columnTitle || row.colName }}
              <span class="controls">
                <span title="拖拽排序"><i class="iconfont icon-tuozhuai drag"></i></span>
                <span title="置顶"
                  ><i class="iconfont icon-zhiding" @click="handleTopOrBottom(rowIndex, 'top')"></i
                ></span>
                <span title="置底"
                  ><i class="iconfont icon-daochu" @click="handleTopOrBottom(rowIndex, 'bottom')"></i
                ></span>
              </span>
            </div>
          </template>
        </vxe-column>
        <vxe-column align="left" title="显示" width="70">
          <template #default="{ row }">
            <span>
              <el-switch
                v-model="row.disPlayed"
                :active-value="1"
                :inactive-value="0"
                :disabled="!!{ ...JSON.parse(row.extendCfg || '{}') }.need"
                @change="handleChange(row)"
              />
            </span>
          </template>
        </vxe-column>
        <vxe-column align="left" title="冻结" width="60">
          <template #default="{ row }">
            <span>
              <el-switch v-model="row.frozen" :active-value="1" :inactive-value="0" @change="handleChange(row)" />
            </span>
          </template>
        </vxe-column>
      </vxe-table>
      <div class="action-panel" style="text-align: center; margin-top: 10px">
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import Sortable from 'sortablejs'
import {Setting} from '@element-plus/icons-vue'
export default {
  name: 'ColumnSort',
  components:{Setting},
  props: {
    showSearch: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    data: { type: Array, default: () => [] }
  },
  data() {
    const self = this

    return {
      query: '',
      loading: false,
      columns: [],
      oriColumns: [],
      customColumnPopShow: false,
      isSearch: false
    }
  },
  watch: {
    customColumnPopShow(visible) {
      if (visible) {
        this.init()
        this.$nextTick(this.rowDrop)
      }
    }
  },
  mounted() {
    this.init()
    this.$nextTick(this.rowDrop)
  },
  methods: {
    // 初始化
    init() {
      const data = (this.initData = this.data
        .filter((f) => !f.hidden)
        .map((v, i) => {
          v.$index = i
          v.rowkey = Math.random()

          if (v.disPlayed == null || v.disPlayed == undefined) {
            v.disPlayed = v.defaultShow ? 1 : 0
            v.frozen = 0
          }

          return v
        }))

      this.query = ''
      this.isSearch = false
      this.columns = JSON.parse(JSON.stringify(data))
      this.oriColumns = JSON.parse(JSON.stringify(data))
    },
    // 行拖拽
    rowDrop() {
      const el = this.$refs.columnSort.querySelector('.vxe-table--body tbody')

      if (!el) {
        setTimeout(() => this.rowDrop, 500)
        return
      }

      Sortable.create(el, {
        handle: '.drag',
        onEnd: ({ newIndex, oldIndex }) => {
          this.$set(this.columns[newIndex], '$index', newIndex + 1)
          const currRow = this.columns.splice(oldIndex, 1)[0]
          currRow.$index = newIndex
          this.columns.splice(newIndex, 0, currRow)
          this.columns.forEach((item, index) => {
            this.$set(item, 'rowkey', Math.random())
            item.$index = index
            this.$set(item, '$index', index)
          })
          console.log(oldIndex, newIndex)
          this.oriColumns = JSON.parse(JSON.stringify(this.columns))
          this.rowDrop()
        }
      })
    },
    // 置顶/置底
    handleTopOrBottom(index, flag) {
      const newIndex = flag === 'top' ? 0 : this.oriColumns.length - 1
      const currRow = this.columns.splice(index, 1)[0]

      this.columns.splice(newIndex, 0, currRow)
      // 找出在原始数据的位置
      const oldIndex = this.oriColumns.findIndex((item) => item.$index === currRow.$index)
      this.oriColumns.splice(oldIndex, 1)
      this.oriColumns.splice(newIndex, 0, currRow)
      this.rowDrop()
    },
    refreshColumn() {
      this.$emit('setSessionColumns', this.oriColumns, true)
    },
    // 查询
    handleQuery() {
      this.columns = this.oriColumns.filter((v) => (v.title || v.columnTitle || v.colName).includes(this.query))
      this.isSearch = this.columns.length !== this.oriColumns.length //   是不是进行过滤了  进行过滤了  不允许排序
    },
    // 保存
    handleSave() {
      const indexStr = this.oriColumns
        .map((d) => d.frozen)
        .toString()
        .replace(/,/g, '')
        .replace(/0+/g, '0')
        .replace(/1+/g, '1')
      if (!['101', '01', '10', '0'].includes(indexStr)) {
        this.$message.error('该字段所在顺序不可冻结，请先进行排序！')
        return
      }

      let unfixedC = -1
      this.oriColumns.map((v, i) => {
        !v.frozen && unfixedC === -1 && (unfixedC = i)
        v.fixed = v.frozen && (unfixedC !== -1 && i > unfixedC ? 'right' : 'left')
      })

      this.refreshColumn()
      this.handleCancel()
    },
    // 显示/冻结 改变事件
    handleChange(row) {
      this.oriColumns = this.oriColumns.map((item) => {
        if (item.$index === row.$index) {
          item = { ...row }
        }

        return item
      })
    },
    // 重置
    handleReset() {
      this.query = ''
      this.isSearch = false
      this.columns = JSON.parse(JSON.stringify(this.initData))
      this.oriColumns = JSON.parse(JSON.stringify(this.initData))
    },
    // 取消
    handleCancel() {
      this.customColumnPopShow = false
    },
    open(){
      this.customColumnPopShow = true
    }
  }
}
</script>
<style lang="scss">
.field-set {
  width: 100%;
  display: flex;
  justify-content: space-between;
  .controls {
    color: #a59e97;
    span {
      margin: 0 3px;
    }
    .iconfont:hover {
      cursor: pointer;
      color: #ffa526;
    }
  }
}
.jr-custom-table-column.el-popover {
  padding: 0;
  .tip {
    padding-top: 10px;
    font-size: 14px;
  }
}
.jr-custom-table-column-body {
  width: 560px;
  max-height: 360px;
  min-height: 10vh;
  overflow: auto;
  padding: 12px;

  .input-search {
    display: flex;
  }
  .jr-checkbox-group {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    .controls {
      background-color: #fff;
      position: absolute;
      color: #646363;
      right: 0;
      padding-right: 10px;
      font-size: 14px;
      display: none;
    }
    .el-checkbox {
      padding: 5px 10px;
      width: calc(50% - 8px);
      margin-right: 0;
      margin-top: 10px;
      overflow: hidden;
      &:nth-child(2n) {
        margin-left: 9px;
      }
      .el-checkbox__label {
        width: 100%;
      }
      &:hover .controls {
        display: inline-block;
      }
    }
  }

  .query-panel {
    width: 50% !important;

    .el-input__suffix {
      cursor: pointer;
      display: flex;
      align-items: center;
      margin-right: 2px;

      svg {
        color: #909399;
      }
    }
  }

  .el-table {
    margin: 10px 0 20px 0;

    .controls {
      background-color: #fff;
      position: absolute;
      color: #646363;
      right: 0;
      padding-right: 10px;
      font-size: 14px;
      display: none;

      span {
        cursor: pointer;
        margin-left: 3px;
      }
    }

    .el-table__row {
      height: 30px !important;
      line-height: 30px !important;

      .el-switch__core {
        min-width: 40px !important;
      }

      &:hover .controls {
        display: inline-block;
      }
    }
  }

  .action-panel {
    text-align: center;
  }
}
</style>
