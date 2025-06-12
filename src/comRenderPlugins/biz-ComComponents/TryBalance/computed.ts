import BigNumberUtils from '@/utils/bigNumberUtil';

// 调用试算接口
export const computedBalance = (formData,tableId) => {
  const curTableData = formData[tableId]
  //计算年化天数
  // 按照公式，年化天数为A/A时需取实际天数，但若存续时间为多年则需分段计算。经确认改逻辑改动相对负责，且中信登报送要求为固定值365，故本次实现需改为均按照固定值365处理
  const days = 365
  // if(curTableData['ANNUALIZED_DAYS_'+tableId] == '1'){
  //   days = 360
  // }else if(curTableData['ANNUALIZED_DAYS_'+tableId] == '2'){
  //   days = 365
  // }else if(curTableData['ANNUALIZED_DAYS_'+tableId] == '3'){
  //   // 获取当前年份
  //   const currentYear = new Date().getFullYear();
  //   if ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0) {
  //     days = 366
  //   } else {
  //     days = 365
  //   }
  // }

  /**
   * 计算信托费用率
   * 信托费用/日均实收信托/存续天数*年化天数
   */
  const TRUST_FEE_RATE =BigNumberUtils.multiply(
    BigNumberUtils.divide(
      BigNumberUtils.divide(curTableData['TRUST_FEES_'+tableId],curTableData['DAILY_AVERAGE_PAID_IN_TRUST_'+tableId],6),
      curTableData['DURATION_OF_EXISTENCE_'+tableId]
      ,8
    ),days
    ,4
  )
  /**
   * 实际信托报酬率
   * (受托人累计基本报酬+受托人累计业绩报酬)/日均实收信托/存续天数*年化天数
   */
  const ACTUAL_TRUST_RETURN_RATE=BigNumberUtils.multiply(
    BigNumberUtils.divide(
      BigNumberUtils.divide(
        BigNumberUtils.add(curTableData['ACCUMULATED_BASIC_'+tableId],curTableData['ACCUMULATED_PERFORMANCE_'+tableId],6),
        curTableData['DAILY_AVERAGE_PAID_IN_TRUST_'+tableId]
        ,8
      ),
      curTableData['DURATION_OF_EXISTENCE_'+tableId]
      ,8
    ),days
    ,4
  )
  /**
   * 实际收益率
   * 实际收益/日均实收信托/存续天数*年化天数
   */
  const REAL_RATE_OF_RETURN = BigNumberUtils.multiply(
    BigNumberUtils.divide(
      BigNumberUtils.divide(
        curTableData['REAL_RETURN_'+tableId],
        curTableData['DAILY_AVERAGE_PAID_IN_TRUST_'+tableId]
        ,8
      ),
      curTableData['DURATION_OF_EXISTENCE_'+tableId]
      ,8
    ),days
    ,4
  )
  /**
   * 计算损失金额
   * 项目整体盈亏情况选择【整体亏损】时，该字段显示并必填，否则不显示
   * 损失金额=累计实收信托-信托本金累计给付额
   */
  let AMOUNT_OF_DAMAGES = ''
  if(formData[tableId][`OVERALL_PROFITABILITY_${tableId}`] === '1'){
    AMOUNT_OF_DAMAGES =BigNumberUtils.subtract(
      curTableData['ACCUMULATED_PAID_IN_TRUST_'+tableId],
      curTableData['ACCUMULATED_PAYMENT_'+tableId]
    )
  }
  return {
    TRUST_FEE_RATE:TRUST_FEE_RATE,
    ACTUAL_TRUST_RETURN_RATE:ACTUAL_TRUST_RETURN_RATE,
    REAL_RATE_OF_RETURN:REAL_RATE_OF_RETURN,
    AMOUNT_OF_DAMAGES:AMOUNT_OF_DAMAGES
  }
}