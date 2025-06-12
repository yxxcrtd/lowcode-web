<template>
  <div class="vue-formula">
    <div class="left">
      <FieldVariable
        class="field-variable"
        @field-select="onFieldSelect"
        :fieldList="fieldList" />
    </div>
    <div class="right">
      <div>
        <CodeEditor v-if="isLoad" @ready="onCmReady" v-model:value="code" height="240" width="550" />
      </div>
      <div class="formula-info-container" v-if="validInfo">
        <span>公式错误：{{ validInfo }}</span>
      </div>
      <div class="formula-operator">
        <span class="operator-title">运算符</span>
        <div class="operator-item" v-for="(item,index) in operatorList" :key="'operator_'+index" @click="onSelectOperator(item)">{{item}}</div>
      </div>
      <div class="operator-container">
        <FormulaList
          :nodes="nodes"
          class="formula-list"
          @formula-click="onFormulaClick"
          @enter-info="onEnterInfo"
        />
        <div v-if="currentFormula" class="formula-info">
          <div class="info-text">{{ currentFormula.tip }}</div>
          <div class="info-text">用法：{{ currentFormula.usage }}</div>
          <div class="info-text">示例：{{ currentFormula.example }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import FormulaEditorCore from './js/index'
import FieldVariable from './Components/FieldVariable.vue'
import FormulaList from './Components/FormulaList.vue'

export default defineComponent({
  name: "Index",
  components: {
    FieldVariable,
    FormulaList,
  },
  props: {
    fieldList: {
      type: Array,
      default: () => [],
    },
    formulaList: {
      type: Array,
      default: () => [],
    },
    formulaConf: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      editorCore: null,
      code: '',
      currentFormula: null,
      validInfo: '',
      isLoad:false,
      operatorList:['+','-','*','/','(',')'],
      options: {
        autofocus: true,
        line: true,
        height: 200,
        theme: '3024-day', // 主题
        tabSize: 4, // 制表符的宽度
        readOnly: false, // 只读
        autorefresh: false,
        smartIndent: true, // 上下文缩进
        lineNumbers: true, // 是否显示行号
        lineWrapping:true,
        styleActiveLine: true, // 高亮选中行
        showCursorWhenSelecting: true, // 当选择处于活动状态时是否应绘制游标
      },
    }
  },
  computed: {
    nodes() {
      return this.formulaList || []
    },
  },
  watch: {
    code(val) {
      console.log(val)
      if (!val) {
        this.validInfo = ''
        return
      }
      const { error, message } = this.editorCore.validateFormula(
        this.fieldList
      )
      console.log(error,message)

      this.validInfo = error ? message : ''
    },
  },
  created() {},
  mounted() {
    this.isLoad=true;
  },
  methods: {
    reset() {
      this.currentFormula = null
      this.editorCore.reset()
    },
    getValid(){
      return this.editorCore.validateFormula(
        this.fieldList
      )
    },
    getData() {
      return this.editorCore.getData()
    },
    onCmReady(codemirror) {
      this.editorCore = new FormulaEditorCore(
        codemirror,
        '',
        this.formulaList
      )
      this.editorCore.registerListen()

      this.editorCore.renderData(this.formulaConf)
    },

    onFormulaClick(formula) {
      this.currentFormula = formula
      this.editorCore.insertText(`${formula.name}()`, 'formula')
    },
    onFieldSelect(field) {
      this.editorCore.insertText(
        {
          ...field,
          menuId: this.currentMenuId,
        },
        'field'
      )
    },
    onEnterInfo(fumulaInfo){
      this.currentFormula = fumulaInfo
    },
    onSelectOperator(o){
      this.editorCore.insertText(o,
        'operator'
      )
    }
  },
})
</script>
<style scoped lang="scss">
.vue-formula {
  border: 1px solid #d7d9dc;
  border-radius: 4px;
  display: flex;
  height: 500px;
  .left{
    width: 200px;
    height: 500px;
  }
  .right{
    position: relative;
    flex:1;
    .formula-info-container {
      padding: 0 6px;
      background-color: #faeeee;
      color: #8d3030;
      display: flex;
      height: 40px;
      align-items: center;
      position: absolute;
      top: 200px;
      left: 39px;
      width: calc(100% - 51px);
    }
    .formula-operator{
      height: 40px;
      display: flex;
      align-items: center;
      border-top: 1px solid #d7d9dc;
      .operator-title{
        margin: 0 10px;
      }
      .operator-item{
        width: 28px;
        height: 28px;
        background: #e1eaf3;
        border-radius: 4px;
        /* color: #fff; */
        text-align: center;
        line-height: 28px;
        margin-right: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        &:hover{
          background: #89bff6;
          color: #fff;
        }
      }
    }
    .operator-container {
      display: flex;
      flex: 1;
      border-top: 1px solid #d7d9dc;
      overflow: hidden;
      .field-variable {
        height: 100%;
        width: 250px;
      }
      .formula-list {
        height: 100%;
        width: 220px;
      }

      .formula-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 6px;
        .info-text {
          font-size: 12px;
          color: #6b7280;
          margin: 6px 0;
        }
      }
    }
  }
}
</style>
<style>
.vue-formula {
  .CodeMirror {
    height: 200px;
  }
}

.CodeMirror-hints {
  z-index: 30000 !important;
  background-color: #f0f0f0;
  color: #333;
  width: 130px;
  font-size: 14px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}
.cm-string {
  color: #f56c6c !important;
}
.cm-field {
  background: #eaf2fd;
  color: #2f7deb !important;
  border-radius: 2px;
  display: inline-block;
  font-size: 14px;
  margin: 0 2px;
  padding: 3px 5px;
}
</style>
