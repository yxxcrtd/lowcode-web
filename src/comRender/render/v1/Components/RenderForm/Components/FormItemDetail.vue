<template>
  <div :class="tagCls" style="width: 100%;">
    <template v-if="showType==='img'">
      <el-image
        style="width: 100px; height: 100px"
        :src="url"
        :zoom-rate="1.2"
        :max-scale="7"
        :min-scale="0.2"
        :preview-src-list="[url]"
        :initial-index="4"
        fit="cover"
      />
    </template>
    <template v-if="showType==='link'">
      <el-link type="primary" underline @click="handleLink()" :icon="Link">{{curValue}}</el-link>
      <open-by-drawer ref="openDrawer"></open-by-drawer>
      <open-by-dialog ref="openDialog"></open-by-dialog>
    </template>
    <template v-if="showType==='text'">
      <span v-if="isRichText" v-html="formatHtml(curValue)"></span>
      <ace-ellipsis :line="line" v-else>
        {{ curValue }}
      </ace-ellipsis>
    </template>
    <template v-if="showType==='slot'">
      <component
        :is="defComponentName"
        v-model="curValue"
      >
      </component>
    </template>
  </div>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'
import AceEllipsis from '@/components/ace/ace-ellipsis/index.vue'
import {getDictLabel, getDictLabels} from '@/utils/dict'
import dayjs from 'dayjs'
import { isArray } from 'lodash-es'
import {Link} from '@element-plus/icons-vue'
import { formatNum } from '@/utils/formatter'
import { formatToDateTime } from '@/utils/dateUtil'
import OpenByDialog from "./OpenByDialog.vue";
import OpenByDrawer from "./OpenByDrawer.vue";
import {useRouter} from 'vue-router'
import bigNumberUtil from "@/utils/bigNumberUtil";

// 普通输入框
defineOptions({ name: 'FormItemDetail' })

const props = defineProps({
  value: propTypes.oneOfType([Number, String, Array, Object]).def(''),
  componentType: propTypes.string.def('input'),
  componentProps: propTypes.object,
  text: propTypes.string,
  fieldConfig: propTypes.object,
  formData: propTypes.object,
  rowData:propTypes.object,
  formGroups: propTypes.array,
  showEllipsis: propTypes.bool.def(true),
  showTooltip: propTypes.bool.def(true)
})
const router = useRouter()
const showType=ref('text')
const defComponentName=ref()
const url=ref()
const line = ref(1)
const curValue = computed(() => {
  return formatText()
})
const unit=computed(()=>{
  return getUnit()
})
const isRichText=computed(()=>{
  return ['ace-textarea'].includes(props.componentType)
})
/**
 * 格式化多行文本或富文本
 * @param text
 */
const formatHtml=(text)=>{
  return text && text.replace(/\n/g, '<br>') || '';
}
/**
 * 格式化表单内容
 */
const formatText = () => {
  if (props.fieldConfig 
    && props.fieldConfig.dataFormatRespVOS 
    && props.fieldConfig.dataFormatRespVOS.formatType=='slot' 
    && props.fieldConfig.dataFormatRespVOS.componentName) {
    showType.value='slot'
    defComponentName.value=props.fieldConfig.dataFormatRespVOS.componentName
    return props.value
  }
  //如果有单独设置数据格式化，按照配置来，
  //如果未设置，按照组件的规则设置
  let showVal=''
  //判断是否有Text数据，如果有，直接显示Text
  if(props.fieldConfig){
    let textValue=''
    if(props.rowData){
      textValue=props.rowData && props.rowData[props.fieldConfig.fieldText]
    }else{
      textValue=props.formData && props.formData[props.fieldConfig.moduleTableId] && props.formData[props.fieldConfig.moduleTableId][props.fieldConfig.fieldText]
    }
    if(textValue){
      return textValue
    }
  }
  if (props.fieldConfig && props.fieldConfig.dataFormatRespVOS) {
    //如果未设置，按照组件的配置回显
    showVal= convertText4Confg()
  } else {
    const text=convertText4Component() || ''
    showVal= text+getUnit()
  }
  return showVal
}

/**
 * 根据回显配置进行转换数据
 */
const convertText4Confg = () => {
  return valueFormat(props.fieldConfig.dataFormatRespVOS, props.value)
}

/**
 * 列数据格式化
 * @param formatCfg
 * @param val
 * @returns {*}
 */
const valueFormat = (formatCfg, val) => {
  //console.log('formatCfg',formatCfg,val)
  const { formatType, prefix, suffix } = formatCfg
  let text = val
  switch (formatType) {
    case 'number':
      text = formatNum(val, true, formatCfg)
      break
    case 'amt':
      text = formatNum(val, true, formatCfg)
      break
    case 'rate':
      text = formatNum(val, true, formatCfg)
      break
    case 'datetime':
      text = formatToDateTime(val, formatCfg.dateFormat)
      break
    case 'img':
      showType.value='img'
    case 'slot':
      showType.value='slot'
      defComponentName.value=formatCfg.componentName
    case 'link':
      showType.value='link'
      if(formatCfg.linkAddress){
        // 使用正则表达式提取 ${...} 内部的内容
        const fieldArr: any = []
        formatCfg.linkAddress.replace(/\${([^}]+)}/g, (match, p1) => {
          fieldArr.push(p1) // 提取捕获组的内容
        })
        const fieldMap = {}
        for (const groupItem of props.formGroups) {
          for (const formItem of groupItem.formItems) {
            if (!fieldMap[formItem.columnName] && fieldArr.includes(formItem.columnName)) {
              fieldMap[formItem.columnName] =
                `formData['${formItem.moduleTableId}'].${formItem.columnName}_${formItem.moduleTableId}`
            }
          }
        }
        //替换变量
        const regex = new RegExp(Object.keys(fieldMap).join('|'), 'g')
        const newScript = formatCfg.linkAddress.replace(regex, (match) => fieldMap[match])
        console.log('newScript',newScript)
        let scriptCode = `return \`${newScript}\``
        const func = new Function('formData', scriptCode) // 将字符串转换为函数
        url.value = func(props.formData) // 调用函数
      }
      break
    case 'regular':
      if (val) {
        const regex = new RegExp(formatCfg.regularExpression, 'g')
        text = val.replace(regex, val)
      }
      break
    case 'script':
      if (formatCfg.script) {
        try {
          // 使用正则表达式提取 ${...} 内部的内容
          const fieldArr: any = []
          formatCfg.script.replace(/\${([^}]+)}/g, (match, p1) => {
            fieldArr.push(p1) // 提取捕获组的内容
          })
          const fieldMap = {}
          for (const groupItem of props.formGroups) {
            for (const formItem of groupItem.formItems) {
              if (!fieldMap[formItem.columnComment] && fieldArr.includes(formItem.columnComment)) {
                fieldMap[formItem.columnComment] =
                  `formData['${formItem.moduleTableId}'].${formItem.columnName}_${formItem.moduleTableId}`
              }
            }
          }
          //替换变量
          const regex = new RegExp(Object.keys(fieldMap).join('|'), 'g')
          const newScript = formatCfg.script.replace(regex, (match) => fieldMap[match])
          let scriptCode = ''
          if (newScript.indexOf('return ') < 0) {
            scriptCode = `
        return \`${newScript}\`
      `
          } else {
            scriptCode = newScript
          }
          console.log('scriptCode',scriptCode)
          const func = new Function('formData', scriptCode) // 将字符串转换为函数
          text = func(props.formData) // 调用函数
        } catch (e) {
          console.log('执行格式化脚本错误：' + e)
        }
      }
      break
  }
  //添加前缀后缀
  if (prefix) {
    text = prefix + text
  }
  if (suffix) {
    text = text + suffix
  }
  return text
}

const tagCls=computed(()=>{
  let clsArr=[]
  const {columnTag}=props.fieldConfig || {}
  if(columnTag){
    if(columnTag.includes('bold')){
      clsArr.push('form-detail-tag-bold')
    }
    if(columnTag.includes('red')){
      clsArr.push('form-detail-tag-red')
    }
  }
  return clsArr
})
/**
 * 根据组件本身的配置进行数据转换
 */
const convertText4Component = () => {
  return componentsMap[props.componentType]
    ? componentsMap[props.componentType](props.value, props.componentProps, props.text)
    : props.value
}
const componentsMap = {
  'ace-input': (val, componentProps) => {
    return val
  },
  'ace-input-number': (val, componentProps) => {
    return formatNumber(val, componentProps.decimalLimit,componentProps.rate)
  },
  'ace-input-currency': (val, componentProps) => {
    return formatAmount(val, componentProps.decimalLimit, componentProps.showThousands,componentProps.rate)
  },
  'ace-radio': (val, componentProps) => {
    return getDictLabel(componentProps.dict, val)
  },
  'ace-select': (val, componentProps) => {
    return componentProps.multiple ? getDictLabels(componentProps.dict, val) || getDictLabels(componentProps.dict, props.fieldConfig.defValue) || props.fieldConfig.defValue || '' : getDictLabel(componentProps.dict, val) || getDictLabels(componentProps.dict, props.fieldConfig.defValue) || props.fieldConfig.defValue || val
  },
  'ace-select-table': (val, componentProps, text) => {
    return text || val
  },
  'ace-select-tabs-table': (val, componentProps, text) => {
    return text || val
  },
  'ace-tree': (val, componentProps, text) => {
    return text || val
  },
  'ace-check-box': (val, componentProps) => {
    return getDictLabels(componentProps.dict, val)
  },
  'ace-date-picker': (val, componentProps) => {
    return formatDate(val, componentProps.valueFormat)
  },
  'ace-date-range-picker': (val, componentProps) => {
    console.log('props.fieldConfig',props.fieldConfig,props.rowData)
    if(props.rowData){
      val=[props.rowData[props.fieldConfig.startDateField],props.rowData[props.fieldConfig.endDateField]]
    }else if(props.formData[props.fieldConfig.moduleTableId]){
      val=[props.formData[props.fieldConfig.moduleTableId][props.fieldConfig.startDateField],
        props.formData[props.fieldConfig.moduleTableId][props.fieldConfig.endDateField]]
    }
    if (isArray(val)) {
      return val.map((item) => formatDate(item, componentProps.valueFormat)).filter(item=>item).join('至')
    }
    return val
  },
  'ace-datetime-picker': (val, componentProps) => {
    return formatDateTime(val, componentProps.valueFormat)
  },
  'ace-datetime-range-picker': (val, componentProps) => {
    if (isArray(val)) {
      return val.map((item) => formatDateTime(item, componentProps.valueFormat)).join('至')
    }
    return val
  },
  'ace-agreement': (val, componentProps) => {
    return getDictLabel('YN', val)
  }
}

/**
 * 格式化数字
 * @param value
 * @param decimalLimit
 */
const formatNumber = (value: number, decimalLimit: number = 2,rate=1) => {
  if (!(value || value === 0) || isNaN(value)) {
    return ''
  }
  return bigNumberUtil.divide(value,rate,Number(decimalLimit)).toString()
}
/**
 * 格式化金额
 * @param value
 * @param decimalLimit
 */
const formatAmount = (value: number, decimalLimit: number = 2, showThousands: boolean = true,rate=1) => {
  if (!value || isNaN(value)) {
    return ''
  }
  const val=bigNumberUtil.divide(value,rate,Number(decimalLimit)).toString()
  // 格式化千分号
  if (showThousands) {
    return val.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  } else {
    return val
  }
}
const formatDate = (value, format = 'YYYY-MM-DD') => {
  if (!value) {
    return ''
  }
  return dayjs(value).format(format)
}
const formatDateTime = (value, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!value) {
    return ''
  }
  return dayjs(value).format(format)
}
const openDrawer = ref()
const openDialog = ref()
const handleLink=()=>{
  const {linkOpenMethod}=props.fieldConfig.dataFormatRespVOS
  if(linkOpenMethod==='newPage'){
    window.open(url.value)
    return;
  }
  if(linkOpenMethod==='newTab'){
    // window.open(url.value)
    router.push({path: '/openLink', query: {url: url.value}});
    return;
  }
  if(linkOpenMethod==='dialog'){
    // window.open(url.value)
    openDialog.value.openDialog(url.value)
    return;
  }
  if(linkOpenMethod==='drawer'){
    // window.open(url.value)
    openDrawer.value.openDrawer(url.value)
    return;
  }
}

const getUnit=()=>{
  if(props.componentType==='ace-input-currency'){
    return props.fieldConfig && props.fieldConfig.props.appendTitle || '元'
  }
  if(props.componentType==='ace-input-number'){
    return props.fieldConfig && props.fieldConfig.props.append || ''
  }
  return ''
}
</script>
