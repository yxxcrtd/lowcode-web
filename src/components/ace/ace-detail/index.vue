<template>
  <ace-ellipsis :line="line">
    {{ curValue }}
  </ace-ellipsis>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'
import AceEllipsis from '@/components/ace/ace-ellipsis/index.vue'
import { getDictLabel } from '@/utils/dict'
import dayjs from 'dayjs'
import { isArray } from 'lodash-es'
import { formatNum } from '@/utils/formatter'
import { formatToDateTime } from '@/utils/dateUtil'

// 普通输入框
defineOptions({ name: 'AceDetail' })

const props = defineProps({
  value: propTypes.oneOfType([Number, String, Array, Object]).def(''),
  componentType: propTypes.string.def('input'),
  componentProps: propTypes.object,
  text: propTypes.string,
  fieldConfig: propTypes.object,
  formData: propTypes.object,
  formGroups: propTypes.array,
  showEllipsis: propTypes.bool.def(true),
  showTooltip: propTypes.bool.def(true)
})

const curValue = computed(() => {
  return formatText()
})
const line = ref(1)
const formatText = () => {
  //如果有单独设置数据格式化，按照配置来，
  //如果未设置，按照组件的规则设置
  if (props.fieldConfig && props.fieldConfig.dataFormatRespVOS) {
    //如果未设置，按照组件的配置回显
    console.log(props.fieldConfig, props.value)
    return convertText4Confg()
  } else {
    return convertText4Component()
  }
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
    case 'link':
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
/**
 * 根据组件本身的配置进行数据转换
 */
const convertText4Component = () => {
  return componentsMap[props.componentType]
    ? componentsMap[props.componentType](props.value, props.componentProps, props.text)
    : props.value
}
const componentsMap = {
  'ace-input': (val, props) => {
    return val
  },
  'ace-input-number': (val, props) => {
    return formatNumber(val, props.decimalLimit)
  },
  'ace-input-currency': (val, props) => {
    return formatAmount(val, props.decimalLimit, props.showThousands)
  },
  'ace-radio': (val, props) => {
    return getDictLabel(props.dict, val)
  },
  'ace-select': (val, props) => {
    return getDictLabel(props.dict, val)
  },
  'ace-select-table': (val, props, text) => {
    return text || val
  },
  'ace-select-tabs-table': (val, props, text) => {
    return text || val
  },
  'ace-tree': (val, props, text) => {
    return text || val
  },
  'ace-check-box': (val, props) => {
    return getDictLabel(props.dict, val)
  },
  'ace-date-picker': (val, props) => {
    return formatDate(val, props.valueFormat)
  },
  'ace-date-range-picker': (val, props) => {
    if (isArray(val)) {
      return val.map((item) => formatDate(item, props.valueFormat)).join('至')
    }
    return val
  },
  'ace-datetime-picker': (val, props) => {
    return formatDateTime(val, props.valueFormat)
  },
  'ace-datetime-range-picker': (val, props) => {
    if (isArray(val)) {
      return val.map((item) => formatDateTime(item, props.valueFormat)).join('至')
    }
    return val
  }
}

/**
 * 格式化数字
 * @param value
 * @param decimalLimit
 */
const formatNumber = (value: number, decimalLimit: number = 2) => {
  if (!value) {
    return ''
  }
  return value.toFixed(decimalLimit)
}
/**
 * 格式化金额
 * @param value
 * @param decimalLimit
 */
const formatAmount = (value: number, decimalLimit: number = 2, showThousands: boolean = true) => {
  if (!value) {
    return ''
  }
  // 格式化千分号
  if (showThousands) {
    const val = value
      .toFixed(decimalLimit)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return val
  } else {
    return value.toFixed(decimalLimit)
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
</script>
