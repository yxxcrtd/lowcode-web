<template>
  <Teleport to="body" :disabled="fullScreenTransFlag">
    <div class="j-vxe-table" ref="vTableContain" id="vxe-table-full">
      <div
        v-if="isShowRightButton"
        class="rightButton"
        id="rightButton"
        :style="`top:${rbPositon.top};left:${rbPositon.left};right:${rbPositon.right};bottom:${rbPositon.bottom}`"
      >
        <RightButton
          :table-id="tableId"
          :dom-id="domId"
          :table-columns="tableColumn"
          :show-right-button="isShowRightButton"
          :export-url="exportUrl"
          :search-param="searchParams"
          :column-url="columnUrl"
          @fullScreen="fullscreenChange"
          @reloadTable="columnRefresh"
          @refreshData="refresh(true)"
        ></RightButton>
      </div>
      <vxe-grid
        ref="vxeTable"
        header-row-class-name="vxetable-header-class"
        :columns="tableColumn"
        :loading="loading"
        :show-overflow="showOverFlow"
        show-header-overflow
        :footer-method="footerCount || footerMethod"
        footer-row-class-name="rowTotalClass"
        :column-config="{ resizable: true }"
        :pager-config="tablePage"
        :data="tableData"
        :border="border"
        :height="height"
        :auto-resize="true"
        align="left"
        header-align="left"
        :sort-config="sortConfig"
        :tooltip-config="tooltipConfig"
        :row-config="{...rowConfig, height: rowHeight, useKey: true }"
        :filter-config="{ filterMethod: filterMethod }"
        :row-class-name="({ row }) => setRowClassName(row)"
        :checkbox-config="checkBoxConfig"
        :radio-config="radioConfig"
        :tree-config="treeConfig"
        :menu-config="tableMenu"
        @menu-click="contextMenuClickEvent"
        @page-change="handlePageChange"
        @sort-change="handleSortChange"
        @resizable-change="resizableChange"
        @cell-click="rowClick"
        @cell-dblclick="rowDoubleClick"
        @checkbox-change="handleCheckBoxChange"
        @checkbox-all="handleCheckAllBoxChange"
        @radio-change="handleRadioChange"
        :show-footer="showFooter"
      >
        <template #dragSort>
          <div class="sortIcon_wrapper">
            <el-icon class="drag-handler">
              <Operation/>
            </el-icon>
          </div>
        </template>
        <template v-for="(index, name) in $slots" #[name]="{ row, rowIndex,column }">
          <slot :name="name" v-bind="{ row, rowIndex, column }"></slot>
        </template>
        <template #empty>
          <el-empty description="暂无数据"/>
        </template>
      </vxe-grid>
    </div>
  </Teleport>
</template>

<script>
import { Operation } from '@element-plus/icons-vue'
import { formatToDate } from '/@/utils/dateUtil';
import request from "@/config/axios";
import Sortable from 'sortablejs';
import RightButton from "./components/RightButton.vue";

  export default {
    components: { Operation,RightButton },
    props: {
      tableId: {
        type: String,
        default: null,
      },
      //全屏单个模块的id
      domId: {
        type: String,
        default: null
      },
      isDefLoadData:{
        type: Boolean,
        default: true
      },
      columnUrl: {
        type: String,
        default: null,
      },
      dataUrl: {
        type: String,
        default: null,
      },
      apiType:{
        type:String,
        default:'get'
      },
      exportUrl: {
        type: String,
        default: null,
      },
      searchParams: {
        type: Object,
        default: null,
      },
      dataFun: {
        type: Function,
        default: null,
      },
      dataSource: {
        type: Array,
        default: null,
      },
      emptyType: {
        type: Number,
        default: 0,
      },
      columns: {
        type: Array,
        default: null,
      },
      defaultSorter: {
        type: [Object, Array],
        default: null,
      },
      showCheckBox: {
        type: Boolean,
        default: false,
      },
      showOverFlow: {
        type: [String, Boolean],
        default: 'tooltip',
      },
      rowConfig: {
        type: Object,
        default: () => ({
          isHover: true
        })
      },
      rowClassName:{
        type:Function
      },
      checkBoxConfig: {
        type: Object,
        default: () => ({ highlight: true }),
      },
      isRowCheck:{
        type:Boolean,
        default:true
      },
      radioConfig: {
        type: Object,
        default: () => {},
      },
      height: {
        type: [String, Number],
        default: null,
      },
      rowHeight: {
        type: Number,
        default: 28,
      },
      maxHeight: {
        type: Number,
        default: null,
      },
      // 判断是否需要分页
      pagerAutoHidden: {
        type: Boolean,
        default: false,
      },
      treeConfig: {
        type: Object,
        default: null,
      },
      sortsOption: {
        type: Object,
        default: null,
      },
      tablePageConfig: {
        type: Object,
        default: null,
      },
      isShowPage: {
        type: Boolean,
        default: false,
      },
      //是否支持多字段排序
      isMultipleSort: {
        type: Boolean,
        default: false,
      },
      defaultColumns: {
        type: Array,
        default: null,
      },
      tableMenu: {
        type: Object,
        default: null,
      },
      excludeCheckBoxColumn: {
        type: Array,
        default: () => [],
      },
      border: {
        type: [Boolean, String],
        default:'inner'
      },
      // 添加行拖拽控制属性
      enableRowDragSort: {
        type: Boolean,
        default: false
      },
      isShowRightButton: {
        type: [Boolean, Array],
        default: true
      },
      rbPositon: {
        type: Object,
        default: () => ({
          top: '-35px',
          left: null,
          right: '0px',
          bottom: null
        })
      },
      // 排序关键字
      dragSortParams: {
        type: Object,
        default: () => ({
          sortKey: 'sort',
          sortRequestUrl: null,
          sortRequestParams: {},
        })
      },
      footerCount:{
        type: Function
      },
      showFooter:{
        type:Boolean,
        default:false
      }
    },
    data() {
      return {
        // 记录当前增加的dom 节点
        node:null,
        // 全屏标志
        fullScreenTransFlag:true,
        loading: false,
        tablePage:{
          enabled: true,
          total: 0,
          currentPage: 1,
          pageSize: 10,
          align: 'right',
          background: false,
          pageSizes: [10, 20, 50, 100, 200], // 调整默认值，和原表格保持一致
          layouts: ['Total', 'PrevPage', 'JumpNumber', 'NextPage', 'Sizes'],
          autoHidden: this.pagerAutoHidden,
          ...this.tablePageConfig || {}
        },
        sortConfig: this.sortsOption || {
          multiple: false,
          trigger: 'cell',
          remote: true,
          orders: ['desc', 'asc', ''],
          defaultSort: {},
        },
        tooltipConfig: {
          theme: 'light',
        },
        sortOrder: [],
        tableData: [],
        tableColumn: [],
        preSumRow: null,
        preTotalCount: 0,
        simpleImage: '',
        localMaxHeight: '100%',
        sortable: null,
        forceUpdate: 0
      };
    },
    computed: {
    },
    watch: {
      dataSource:{
        handler:function(val){
          // this.tableData=val;
          if (this.tablePage && !this.tablePage.enabled){
            console.log('ddd',val)
            this.tableData=val;
            this.loading = false;
            return
          }
          this.tableData = val.slice((this.tablePage.currentPage - 1) * this.tablePage.pageSize, this.tablePage.currentPage * this.tablePage.pageSize);
          this.tablePage.total = val.length;
          this.loading = false;
        },
        deep:true
      },
    },
    created() {
      // 获取默认的排序方式
      if (this.defaultSorter) {
        if (Array.isArray(this.defaultSorter)) {
          this.sortOrder = [...this.defaultSorter];
        } else {
          this.sortOrder = [this.defaultSorter];
        }
      }
      if (this.sortOrder && this.sortOrder.length) {
        this.sortConfig.defaultSort = this.sortOrder;
      }
      if (this.isMultipleSort) {
        this.sortConfig.multiple = true;
      }
      // 如果外部没有传入高度，最大高度设置未屏幕高度
      // if (!this.maxHeight) {
      //   const screenHeight = document.documentElement.clientHeight;
      //   this.localMaxHeight = screenHeight - 220;
      // } else {
      //   this.localMaxHeight = this.maxHeight;
      // }
      this.loadColumn();
    },
    mounted() {
      if(this.isDefLoadData){
        this.loadData();
      }
    },
    methods: {
      /**
       * 动态加载列
       * @returns {Promise<void>}
       */
      async loadColumn() {
        // 如果开启了拖拽功能，添加拖拽列
        if (this.enableRowDragSort) {
          this.tableColumn = [
            {
              field: 'dragSort',
              title: '',
              width: 60,
              align: 'center',
              slots: { default: 'dragSort' }
            },
            ...(this.columns || [])
          ]
        } else {
          this.tableColumn = this.columns
        }
      },
      fullscreenChange() {
        this.$nextTick(() => {
          if (!this.fullScreenTransFlag) {
            //   代表当前是全屏状态点击后退出全屏
            if (this.node) {
              const elementByTableContain = this.node
              const elementByRightButton = elementByTableContain.children && Array.from(elementByTableContain.children).find(item => item.id === "rightButton")
              elementByTableContain.classList.remove("dom-full-screen");
              elementByRightButton.classList.remove("dom-full-screen-right");
            }
            this.fullScreenTransFlag = true
          } else {
            let element = null
            // 避免出现使用el-tab 有多个JTable 但页面找错的情况
            const list = document.getElementsByClassName('j-vxe-table')
            if (list.length > 1) {
              for (let i = 0; i < list.length; i++) {
                const item = list[i]
                if (item.offsetParent && item.offsetParent.className === "el-tabs__content") {
                  if (!item.hidden) {
                    element = item
                  }
                }
              }
            } else {
              element = list.length > 0 && list[0]
            }
            if (element) {
              this.node = element
            }
            if (this.node) {
              // 寻找当前下面的右边按钮
              const elementByRightButton = this.node.children && Array.from(this.node.children).find(item => item.id === "rightButton")
              element.classList.add("dom-full-screen")
              elementByRightButton.classList.add("dom-full-screen-right");
              this.fullScreenTransFlag = false
            }
          }
        })
      },
      // 退出全屏
      columnRefresh() {
        return this.loadColumn();
      },
      setRowClassName(row) {
        if(this.rowClassName){
          return this.rowClassName({row});
        }
        if (row.isdel === 1) {
          return 'font25';
        }
      },
      vxeFormatDate({ cellValue }) {
        return formatToDate(cellValue);
      },
      scrollToRow(rowIndex){
        this.$nextTick(()=>{
          this.$refs.vxeTable.scrollToRow(this.tableData[rowIndex]);
        })
      },
      resizableChange({ $rowIndex, column, columnIndex, $columnIndex, $event }) {},
      /**
       * 刷新表格
       * @param bool 是否转到第一页，默认值false
       */
      refresh(bool = false) {
        bool && (this.tablePage.currentPage = 1);
        this.loadData();
      },
      rowClick({ row, column, columnIndex }) {
        if(column.field == 'action'){
          return
        }
        if (this.isRowCheck && !this.excludeCheckBoxColumn.includes(column.field) && column.type != 'checkbox') {
          this.$refs.vxeTable.toggleCheckboxRow(row);
        }
        this.$emit('row-click', row, column, columnIndex);
      },
      rowDoubleClick({ row, column, columnIndex }) {
        this.$emit('row-dbl-click', row, column, columnIndex);
      },
      /**
       * 清除排序
       */
      clearSort() {
        this.$refs.vxeTable.clearSort();
      },
      /**
       * 设置勾选项
       * @param row
       * @param checked
       */
      setCheckboxRow(row, checked) {
        const rowArray = Array.isArray(row) ? row : [row];
        this.$refs.vxeTable.setCheckboxRow(rowArray, checked);
      },
      setRadioRow(row, checked) {
        this.$refs.vxeTable.setRadioRow(row, checked);
      },
      clearRadioRow(){
        this.$refs.vxeTable.clearRadioRow()
      },
      setCheckboxRows(rows, checked) {
        this.$refs.vxeTable.setCheckboxRow(rows, checked);
      },
      /**
       * 获取所有勾选项
       * @returns {*}
       */
      getCheckboxRecords() {
        return this.$refs.vxeTable.getCheckboxRecords() || [];
      },
      getRadioRecord() {
        return this.$refs.vxeTable.getRadioRecord() || [];
      },
      /**
       * 获取半选勾选项
       * @returns {*}
       */
      getCheckboxIndeterminateRecords() {
        return this.$refs.vxeTable.getCheckboxIndeterminateRecords();
      },
      /**
       * 全选
       */
      setAllCheckboxRow() {
        this.$refs.vxeTable.setAllCheckboxRow(true);
      },
      /**
       * 清除所有勾选
       */
      clearCheckboxRow() {
        this.$refs.vxeTable.clearCheckboxRow();
      },
      /**
       * 加载数据
       */
      async loadData(op) {
        this.loading = true;
        if (op === 'reload') {
          this.tablePage.currentPage = 1
          this.tablePage.pageSize = 10
          // 删除功能，当前页面只有1条数据
        } else if (op === 'delLast') {
          this.tablePage.currentPage -= 1
        }
        const parameter = {
          pageNo: this.tablePage.currentPage,
          pageSize: this.tablePage.pageSize,
        };
        if (this.sortOrder && this.sortOrder.length) {
          let sortList = this.sortOrder.filter((item) => item.order);
          if (sortList && sortList.length) {
            if (this.sortOrder.length > 1) {
              parameter.sortdesc = sortList;
              this.sortOrder.sortdesc = parameter.sortdesc;
            } else {
              parameter.field = sortList[0].field;
              parameter.order = sortList[0].order;
            }
          }
        }
        console.log(this.tablePage,'9090909090');
        //优先取datasource
        if (this.dataSource) {
          console.log(this.dataSource,'909090');
          // this.tableData = this.dataSource // 返回结果中的数组数据
          this.tableData = this.dataSource;
          this.tablePage.total = this.dataSource.length;
          this.loading = false;
          this.$emit('load-success', this.tableData);
          // 初始化拖拽事件
          this.initSortable();
          return;
        }
        if (this.dataFun) {
          const result = this.dataFun({...parameter,...this.searchParams});

          // 对接自己的通用数据接口需要修改下方代码中的 r.pageNo, r.totalCount, r.data
          // eslint-disable-next-line
          if ((typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function') {
            result.then((r) => {
              console.log(r);
              this.tableData = r.list || r.records || r;
              this.tablePage.total = r.total;
              this.loading = false;
              this.$emit('load-success', this.tableData);
              this.$emit('data-change');
            });
          } else {
            // 返回结果为空
            this.loading = false;
            this.$emit('load-success', null);
          }
          // 初始化拖拽事件
          this.initSortable();
          return;
        }
        if (this.dataUrl) {
          let pageMode = {
            pageNo: parameter.pageNo,
            pageSize: parameter.pageSize,
            direction: parameter.sord,
            sort: parameter.sidx,
          };
          let res=null
          if(this.apiType==='post'){
            res=await request.post({ url: this.dataUrl,data:{ ...pageMode, ...this.searchParams }})
          }else{
            res=await request.get({ url: this.dataUrl,params:{ ...pageMode, ...this.searchParams }})
          }
          this.tableData = res.records || res.list || res;
          if (this.isShowPage || res.total) {
            this.tablePage.total = res.total || 0;
            this.tablePage.enabled = true;
          } else {
            this.tablePage.enabled = false;
          }
          this.loading = false;
          this.loadFilterData();
          this.$emit('load-success', this.tableData);
          this.$emit('data-change');
          // 初始化拖拽事件
          this.initSortable();
          return;
        }
      },
      loadFilterData() {
        this.$nextTick(() => {
          const $table = this.$refs.vxeTable;
          if ($table) {
            this.tableColumn.forEach((item) => {
              if (item.isFilter) {
                const nameColumn = $table.getColumnByField(item.field);
                if (nameColumn) {
                  let columnData = [];
                  this.tableData.map((dataItem) => {
                    let findIndex = columnData.findIndex((colItem) => colItem.value == dataItem[item.field]);
                    if (findIndex < 0) {
                      columnData.push({
                        label: dataItem[item.field],
                        value: dataItem[item.field],
                      });
                    }
                  });
                  $table.setFilter(nameColumn, columnData);
                }
              }
            });
          }
        });
      },
      filterMethod({ options, values, cellValue, row, column }) {
        return values.includes(row[column.field]);
      },
      /**
       * 底部总计
       * @param columns
       * @param data
       * @returns {*[][]}
       */
      footerMethod({ columns, data }) {
        const sums = [];
        // 返回一个二维数组的表尾合计
        return [sums];
      },
      /**
       * 翻页事件
       * @param currentPage
       * @param pageSize
       */
      handlePageChange({ currentPage, pageSize }) {
        this.tablePage.currentPage = currentPage;
        this.tablePage.pageSize = pageSize;
        this.loadData();
      },
      /**
       * 排序
       * @param property
       * @param order
       */
      handleSortChange({ column, property, order, sortBy }) {
        let sortField = column.sortBy || property;
        if (this.isMultipleSort) {
          if (order) {
            let curProperty = this.sortOrder.find((item) => item.field === sortField);
            if (curProperty) {
              curProperty.order = order;
            } else {
              this.sortOrder.push({
                field: sortField,
                order: order,
              });
            }
          } else {
            this.sortOrder = this.sortOrder.filter((item) => item.field != sortField);
          }
        } else {
          this.sortOrder = [
            {
              field: sortField,
              order: order,
            },
          ];
        }

        // 不需要远程时无需查询表
        if (this.sortConfig.remote) {
          this.loadData();
        }
        this.$emit('sortChange', this.sortOrder);
      },
      handleCheckBoxChange(params){
        this.$emit('checkbox-change', params);
      },
      handleCheckAllBoxChange(params){
        this.$emit('checkbox-all', params);
      },
      getTableData() {
        return this.$refs.vxeTable.getTableData();
      },
      handleRadioChange(params){
        this.$emit('radio-change', params);
      },
      contextMenuClickEvent({ menu, row, column }) {
        let menuData = {
          menu: menu,
          row: row,
        };
        this.$emit('contextMenu', menu, row);
      },

      /**
       * 获取缓存列头
       */
      getSessionColumns() {
        return window.localStorage && JSON.parse(localStorage.getItem(`${this.tableId}-advancedTableColumns-V1`));
      },
      /**
       * 设置缓存列头
       * isUser: 是否用户修改
       */
      setSessionColumns(data, isUser) {
        const self = this;

        const { pageCode, dtCode, columnKey } = this;
        self.oriColumns = JSON.parse(JSON.stringify(data)).filter((item) => item.isHide !== 'Y') || [];
        isUser && window.localStorage && localStorage.setItem(`${this.tableId}-advancedTableColumns-V1`, JSON.stringify(data || []));

        self.convertColumn(self.oriColumns);
        self.oriColumns.length && self.appendEmptyRow();
      },

      setCellClassName(data){
        return data.column.field+'-cell-cls'
      },
      setHeaderCellClassName(data){
        return data.column.field+'-head-cell-cls'
      },
      /**
       * 初始化拖拽排序功能
       * 使用 Sortable.js 库实现表格行拖拽
       */
      initSortable() {
        // 获取表格的 tbody 元素作为拖拽容器
        const el = this.$refs.vxeTable.$el.querySelector('.vxe-table--body tbody')
        
        // 如果已经存在 sortable 实例，先销毁它，避免重复绑定
        if (this.sortable) {
          this.sortable.destroy()
        }

        // 创建新的 Sortable 实例
        this.sortable = Sortable.create(el, {
          handle: '.drag-handler', // 指定拖拽触发的元素类名，只有点击该元素才能拖拽
          animation: 150,          // 定义排序动画的时间，单位：毫秒
          onEnd: this.dragSortableEnd // 拖拽结束的回调函数
        });
      },

      /**
       * 拖拽结束后的处理函数
       * @param {Object} event - 拖拽事件对象
       * @param {number} event.newIndex - 放置位置的新索引
       * @param {number} event.oldIndex - 拖拽元素原来的索引
       */
      dragSortableEnd(event) {
        const newIndex = event.newIndex
        const oldIndex = event.oldIndex
        
        // 更新数据顺序：先删除原位置的数据，再插入到新位置
        const currRow = this.tableData.splice(oldIndex, 1)[0]
        this.tableData.splice(newIndex, 0, currRow)
        
        // 更新每一行的排序字段值
        this.tableData.forEach((item, index) => {
          return {
            ...item,
            [this.dragSortParams.sortKey]: index,
            _XID: index
          }
        })

        // 更新表格数据
        this.$nextTick(() => {
          // 重新加载数据以更新内部序号
          this.$refs.vxeTable?.reloadData(this.tableData)
        })

        this.$nextTick(() => {
          this.$refs.vxeTable.loadData(this.tableData)
        })

        // 如果配置了保存接口地址，则调用接口保存新的排序
        if (this.dragSortParams.sortRequestUrl) {
          this.saveDragSort()
        }
      },

      /**
       * 调用后端接口保存排序结果
       * 将更新后的排序数据发送到服务器
       */
      saveDragSort() {
        // 获取请求参数配置
        const params = this.dragSortParams.sortRequestParams
        
        // 构建要保存的数据列表
        // 只保存必要的字段：id 和排序值
        const dataList = this.tableData.map((item) => ({
          [this.dragSortParams.sortKey]: item[this.dragSortParams.sortKey], // 排序字段
          id: item.id || null // 记录ID，如果没有则为null
        }))
        
        // TODO: 这里需要补充发送请求的代码
      }
    },
  };
</script>

<style lang="scss" scoped>
.dom-full-screen{
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  padding: 30px 0;
  z-index: 20;
  :deep(.vxe-table--render-wrapper){
    height: 100vh;
  }
  :deep(.vxe-grid--pager-wrapper){
    position: absolute;
    bottom: 40px;
    right: 10px;
  }
}
.dom-full-screen-right{
  right: 10px !important;
  top: 10px !important;
  z-index: 21;
}
  .empty-info {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    img {
      margin-bottom: 8px;
    }
  }
  :deep(.vxe-cell--title) {
    font-weight: 900;
    color: #666;
    font-size: 12px;
  }
  :deep(.sort--active){
    border-color: #606266;
  }
  // .sortIcon_wrapper {
  //   cursor: move;
  //   display: none;
  // }
  :deep(.vxe-body--row) {
    &:hover {
      .sortIcon_wrapper {
        display: block;
        cursor: move;
        color: var(--el-color-primary);
      }
    }
  }
</style>
<style lang="scss">
  .j-vxe-table {
    width: 100%;
    height: 100%;
    max-height: 90vh;
    position: relative;
    .vxe-grid.is--loading:before {
      background: unset !important;
    }
    .is--loading {
      background: transparent !important;
    }
  }
</style>
