/**
 * JavaScript 代码执行器
 * 
 * @Author: miffy
 * @Date: 2024-11-20
 * @Description: 该类用于动态执行 JavaScript 代码字符串，支持同步和异步执行。
 * 
 */

export class JSExecutor {
  /**
   * 执行代码
   * @param {string} jsString 完整的JS代码字符串
   * @param {Object} thisArg this指向
   * @returns {Promise<any>|any}
   */
  async execute(jsString: string, thisArg?: any): Promise<any> {
    try {
      const { code, params } = this.parseJSString(jsString);
      const { async = false, context } = params;

      const processedCode = this.preprocessCode(code);
      const thisContext = context || thisArg || this;

      if (async) {
        return await this.executeAsync(processedCode, params, thisContext);
      } else {
        return this.executeSync(processedCode, params, thisContext);
      }
    } catch (error) {
      throw new Error(`执行失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 预处理并解析JSON字符串
   * @private
   */
  private preprocessJSON(jsonStr: string): any {
    try {
      // 处理函数定义，保持函数可执行性
      const processed = jsonStr
        .replace(/\n\s*/g, '')  // 移除换行和相关空白
        .replace(/\s+/g, ' ')   // 多个空格替换为单个
        .trim();

      // 使用 Function 构造器直接解析
      const obj = (new Function('return ' + processed))();
      return obj;
    } catch (error) {
      console.warn('参数预处理警告:', error instanceof Error ? error.message : String(error));
      return {};
    }
  }

  /**
   * 解析JS代码字符串
   * @private
   */
  private parseJSString(jsString: string): { code: string; params: any } {
    try {
      if (!jsString || typeof jsString !== 'string') {
        throw new Error('输入不能为空且必须是字符串');
      }

      const paramsMatch = jsString.match(/@params\s*({[\s\S]*?})\s*@code/);
      const codeMatch = jsString.match(/@code\s*([\s\S]*?)$/);

      if (!paramsMatch || !codeMatch) {
        throw new Error('无效的代码格式，必须包含 @params 和 @code 部分');
      }

      const paramsStr = this.extractCompleteJSON(paramsMatch[1]);
      const params = this.preprocessJSON(paramsStr);

      const code = codeMatch[1].trim();
      if (!code) {
        throw new Error('代码体不能为空');
      }

      return { code, params };
    } catch (error) {
      throw new Error('代码解析失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * 提取完整的JSON字符串
   * @private
   */
  private extractCompleteJSON(jsonStr: string): string {
    let count = 0;
    let endIndex = 0;

    for (let i = 0; i < jsonStr.length; i++) {
      if (jsonStr[i] === '{') count++;
      if (jsonStr[i] === '}') {
        count--;
        if (count === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }

    return jsonStr.substring(0, endIndex);
  }

  /**
   * 预处理代码
   * @private
   */
  private preprocessCode(code: string): string {
    let processedCode = code.trim();

    // 检查是否包含return语句
    const hasReturn = /^[^\/]*\breturn\b/.test(processedCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ''));

    // 如果没有return语句，添加默认返回false
    if (!hasReturn) {
      processedCode = `${processedCode}; return false;`;
    }

    return processedCode;
  }

  /**
   * 同步执行代码
   * @private
   */
  private executeSync(code: string, params: Record<string, any>, thisContext: any): any {
    const paramNames = Object.keys(params).filter((key) => key !== 'async' && key !== 'context');
    const paramValues = paramNames.map((name) => params[name]);

    const executeFn = new Function(
      ...paramNames,
      `
          'use strict';
          ${code}
      `
    );

    return executeFn.apply(thisContext, paramValues);
  }

  /**
   * 异步执行代码
   * @private
   */
  private async executeAsync(code: string, params: Record<string, any>, thisContext: any): Promise<any> {
    const paramNames = Object.keys(params).filter((key) => key !== 'async' && key !== 'context');
    const paramValues = paramNames.map((name) => params[name]);

    const executeFn = new Function(
      ...paramNames,
      `
          'use strict';
          return (async () => {
              ${code}
          })();
      `
    );

    return await executeFn.apply(thisContext, paramValues);
  }
}
