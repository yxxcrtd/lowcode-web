import request from '@/config/axios';

interface DataSetResponse {
  dataSetType: string;
  type:string;
  httpUrl: string;
  httpType: string;
  httpParameter: string;
  httpHeaders: Record<string, string>;
  dataList: any[];
  jsonData:any;
  dataPath?: string; // 添加数据路径配置
}

// 添加接口返回格式定义
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

/**
 * 从对象中获取嵌套属性值
 */
function getNestedValue(obj: any, path: string = 'data'): any {
  return path.split('.').reduce((value, key) => value?.[key], obj);
}

/**
 * 获取数据集数据
 * @param dataSetCode 数据集编码
 */
async function fetchDataSetData(dataSetCode: string): Promise<any[]> {
  try {
    // 首先获取数据集配置
    const dataSetConfig = await request.get<DataSetResponse>({
      url: `/infra/data-set-config/getcode?code=${dataSetCode}`
    });

    // 根据数据集类型处理数据
    if (dataSetConfig.type === 'json') {
      return JSON.parse(dataSetConfig.jsonData)
    } 
    
    if (dataSetConfig.dataSetType === 'request') {
      // 处理请求参数
      const requestParams = dataSetConfig.httpParameter ? JSON.parse(dataSetConfig.httpParameter) : {};
      
      // 构建请求配置
      const requestConfig = {
        url: dataSetConfig.httpUrl,
        params: dataSetConfig.httpType.toLowerCase() === 'get' ? requestParams : undefined,
        data: dataSetConfig.httpType.toLowerCase() !== 'get' ? requestParams : undefined,
        headers: dataSetConfig.httpHeaders
      };

      // 发送请求获取响应
      let response: ApiResponse<any>;
      switch (dataSetConfig.httpType.toLowerCase()) {
        case 'get':
          response = await request.get(requestConfig);
          break;
        case 'post':
          response = await request.post(requestConfig);
          break;
        case 'put':
          response = await request.put(requestConfig);
          break;
        default:
          throw new Error(`不支持的请求类型: ${dataSetConfig.httpType}`);
      }

      // 检查响应状态
      if (response.code !== 0 && response.code !== 200) {
        throw new Error(response.message || '请求失败');
      }

      // 获取实际数据
      const dataPath = dataSetConfig.dataPath || 'data';
      const actualData = getNestedValue(response, dataPath);

      // 确保返回数组格式
      if (Array.isArray(actualData)) {
        return actualData;
      } else if (actualData === null || actualData === undefined) {
        return [];
      } else {
        return [actualData];
      }
    }

    throw new Error(`不支持的数据集类型: ${dataSetConfig.dataSetType}`);
  } catch (error) {
    console.error('获取数据集数据失败:', error);
    throw error;
  }
}

export default fetchDataSetData;