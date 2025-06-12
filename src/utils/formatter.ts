import { floatToFixed2 } from '@/utils'
import bigNumberUtil from "@/utils/bigNumberUtil";

export interface FormatCfg {
  prefix?:string,//前缀
  suffix?:string,//后缀
  formatType?:string,//格式化类型
  numType?:string,//数字类型
  keepDecimalPlaces?:string,//保留小数位数
  conversionRate?:string,//转换倍率
  thousandth?:boolean//千分位符
}

// 格式化金额【分转元】
// @ts-ignore
export const fenToYuanFormat = (_, __, cellValue: any, ___) => {
  return `￥${floatToFixed2(cellValue)}`
}

/**
 * 格式化金额
 * @param val 金额数字
 * @param isRounding 是否四舍五入
 * @param formatCfg 格式化配置
 */
export const formatNum = (val:number=0,isRounding:boolean=false,formatCfg:FormatCfg) => {
  if(!val || isNaN(val)){
    val=0
  }
  let newValue = val
  if (formatCfg.conversionRate) {
    newValue = bigNumberUtil.divide(val,Number(formatCfg.conversionRate))
  }
  newValue = newValue * 1.0
  // 是否四舍五入
  let newValueStr = newValue.toString()
  if (isRounding && formatCfg.keepDecimalPlaces) {
    newValueStr = newValue.toFixed(Number(formatCfg.keepDecimalPlaces))
  } else if (formatCfg.keepDecimalPlaces){
    newValueStr = newValue.toFixed(Number(formatCfg.keepDecimalPlaces) + 1).slice(0, -1)
  }
  const splitNewValue = newValueStr.toString().split('.')
  let result:string = splitNewValue[0]
  if (formatCfg.thousandth) {
    result = Number(splitNewValue[0]).toLocaleString()
  }
  if (splitNewValue.length > 1) {
    return `${result}.${splitNewValue[1]}`
  }else {
    return result
  }
}

/**
 * 金额格式化
 * @param value
 * @param decimalNum 保留位数
 * @param isRounding 是否四舍五入
 * @param isAmount是否展示金额类型(千分号
 */
export const formatCurrency = (value = 0, decimalNum = 2, isRounding = true, isAmount = false) => {
  let newValue
  // 是否四舍五入
  if (isRounding) {
    // 使用toFixed函数对 value 进行四舍五入，并保留指定的小数位数
    newValue = parseFloat(Number(value).toFixed(decimalNum))
  } else {
    // 保留x位小数 则保留x+1位 但只截取x位小数，达到不进行四舍五入的效果
    newValue = parseFloat(
      Number(value)
        .toFixed(decimalNum + 1)
        .slice(0, -1)
    )
  }
  // 初始化一个空字符串，用于存储小数部分的零
  let zeroDecimal = ''
  // 根据参数决定是否需要生成小数点后的零
  const zeroNumFn = (isZero = false, countDeciNum?) => {
    // 计算需要填充的零的数量
    const forNum = isZero ? decimalNum : countDeciNum
    // 循环生成零，并附加到 zeroDecimal 字符串中
    for (let i = 0; i < forNum; i++) {
      zeroDecimal += '0'
    }
  }

  // 如果 newValue 是 0 或者不是一个数字，则生成带有指定小数位数的零
  if (newValue == 0 || isNaN(newValue)) {
    zeroNumFn(true)
    // 返回格式化的字符串，包括整数部分和小数部分
    return '0' + (decimalNum == 0 ? '' : '.') + zeroDecimal
  }

  // 将 newValue 转换为字符串，并分割成整数部分和小数部分
  const splitNewValue = newValue.toString().split('.')

  // 如果存在小数部分
  if (splitNewValue[1]) {
    // 如果小数部分的长度与期望的小数位数不一致
    if (splitNewValue[1].length !== decimalNum) {
      // 补充缺少的零
      zeroNumFn(false, Math.abs(decimalNum - Number(splitNewValue[1].length)))
      // 将原始的小数部分与补充的零合并
      zeroDecimal = splitNewValue[1] + zeroDecimal
    }
    // 如果小数部分的长度与期望的小数位数一致
    else {
      // 直接使用原始的小数部分
      zeroDecimal = splitNewValue[1]
    }
  }
  // 如果没有小数部分
  else {
    // 生成指定数量的零
    zeroNumFn(true)
  }

  // 如果 isAmount 为 true，则使用 toLocaleString 方法格式化整数部分，否则直接使用整数部分
  const integerNum = isAmount ? Number(splitNewValue[0]).toLocaleString() : splitNewValue[0]

  // 返回最终格式化的字符串，包括整数部分和小数部分
  return `${integerNum}${decimalNum == 0 ? '' : '.'}${zeroDecimal}`
}

export const formatNumber=(num, precision)=>{
  if(num===null || num===undefined){
    num=0
  }
  // 将数字转换为字符串，并以点分隔小数
  const numStr = num.toFixed(precision);
  // 以点分隔小数，并取得分隔后的部分
  const parts = numStr.split('.');
  // 如果小数部分不足指定的位数，用0补齐
  while (parts[1] && parts[1].length < precision) {
    parts[1] += '0';
  }
  // 将补齐后的小数部分重新连接并转换回数字
  return Number(parts.join('.'));
}

/**
 * 数字金额格式过滤(转汉字大写) 12000.34 => "壹万贰千叁角肆分"
 * @param {number} num 被转换数字
 */
export const digitUppercase = (amt: any) => {
  let num=String(amt).replaceAll(',','')
  const reg = /((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/
  if (!reg.test(num)) {
    return "请输入正确的金额格式"
  } else {
    const fraction = ["角", "分"]
    const digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]
    const unit = [
      ["元", "万", "亿", "兆"],
      ["", "拾", "佰", "仟"]
    ]
    const head = num < 0 ? "欠" : ""
    num = Math.abs(num)
    let s = ""
    fraction.forEach((item, index) => {
      s += (digit[Math.floor(num * 10 * Math.pow(10, index)) % 10] + item).replace(/零./, "")
    })
    s = s || "整"
    num = Math.floor(num)
    for (let i = 0; i < unit[0].length && num > 0; i++) {
      let p = ""
      for (let j = 0; j < unit[1].length && num > 0; j++) {
        p = digit[num % 10] + unit[1][j] + p
        num = Math.floor(num / 10)
      }
      s = p.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + s
    }
    return (
      head +
      s
        .replace(/(零.)*零元/, "元")
        .replace(/(零.)+/g, "零")
        .replace(/^整$/, "零元整")
    )
  }
}