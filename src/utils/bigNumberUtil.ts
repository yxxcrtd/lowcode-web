import BigNumber from 'bignumber.js';

class BigNumberUtils {
  /**
   * 加法运算
   * @param {number|string|BigNumber} a - 第一个操作数
   * @param {number|string|BigNumber} b - 第二个操作数
   * @param {number} [decimalPlaces] - 保留小数位数
   * @returns {string} 计算结果字符串
   */
  static add(a, b, decimalPlaces=2) {
    try {
      const result = new BigNumber(a).plus(new BigNumber(b));
      return decimalPlaces !== undefined
        ? result.toFixed(decimalPlaces, BigNumber.ROUND_HALF_UP)
        : result.toString();
    } catch (error) {
      console.error('加法运算错误:', error);
      return '0';
    }
  }

  /**
   * 减法运算
   * @param {number|string|BigNumber} a - 第一个操作数
   * @param {number|string|BigNumber} b - 第二个操作数
   * @param {number} [decimalPlaces] - 保留小数位数
   * @returns {string} 计算结果字符串
   */
  static subtract(a, b, decimalPlaces=2) {
    try {
      const result = new BigNumber(a).minus(new BigNumber(b));
      return decimalPlaces !== undefined
        ? result.toFixed(decimalPlaces, BigNumber.ROUND_HALF_UP)
        : result.toString();
    } catch (error) {
      console.error('减法运算错误:', error);
      return '0';
    }
  }

  /**
   * 乘法运算
   * @param {number|string|BigNumber} a - 第一个操作数
   * @param {number|string|BigNumber} b - 第二个操作数
   * @param {number} [decimalPlaces] - 保留小数位数
   * @returns {string} 计算结果字符串
   */
  static multiply(a, b, decimalPlaces=2) {
    try {
      const result = new BigNumber(a).multipliedBy(new BigNumber(b));
      return decimalPlaces !== undefined
        ? result.toFixed(decimalPlaces, BigNumber.ROUND_HALF_UP)
        : result.toString();
    } catch (error) {
      console.error('乘法运算错误:', error);
      return '0';
    }
  }

  /**
   * 除法运算
   * @param {number|string|BigNumber} a - 被除数
   * @param {number|string|BigNumber} b - 除数
   * @param {number} [decimalPlaces] - 保留小数位数
   * @returns {string} 计算结果字符串
   */
  static divide(a, b, decimalPlaces=2) {
    try {
      if (new BigNumber(b).isZero()) {
        console.error('除法运算错误: 除数不能为0');
        return '0';
      }
      const result = new BigNumber(a).dividedBy(new BigNumber(b));
      return decimalPlaces !== undefined
        ? result.toFixed(decimalPlaces, BigNumber.ROUND_HALF_UP)
        : result.toString();
    } catch (error) {
      console.error('除法运算错误:', error);
      return '0';
    }
  }

  /**
   * 比较两个数字的大小
   * @param {number|string|BigNumber} a - 第一个数字
   * @param {number|string|BigNumber} b - 第二个数字
   * @returns {number} 1(a>b), 0(a=b), -1(a<b), NaN(错误)
   */
  static compare(a, b) {
    try {
      return new BigNumber(a).comparedTo(new BigNumber(b));
    } catch (error) {
      console.error('比较大小错误:', error);
      return NaN;
    }
  }

  /**
   * 格式化数字（四舍五入）
   * @param {number|string|BigNumber} num - 要格式化的数字
   * @param {number} decimalPlaces - 保留小数位数
   * @returns {string} 格式化后的字符串
   */
  static format(num, decimalPlaces) {
    try {
      return new BigNumber(num).toFixed(decimalPlaces, BigNumber.ROUND_HALF_UP);
    } catch (error) {
      console.error('数字格式化错误:', error);
      return '';
    }
  }

  /**
   * 检查是否为有效数字
   * @param {number|string|BigNumber} num - 要检查的值
   * @returns {boolean} 是否为有效数字
   */
  static isValidNumber(num) {
    try {
      return !new BigNumber(num).isNaN();
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取有几位小数
   * @param num
   */
  static getDecimalPlacesLen(num) {
    // 将数字转换为字符串
    const numStr = num.toString();
    // 检查是否有小数点
    if (numStr.indexOf('.') === -1) {
      return 0;
    }
    // 分割字符串并返回小数部分长度
    return numStr.split('.')[1].length;
  }
}

export default BigNumberUtils;
