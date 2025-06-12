import request from '@/config/axios'

export interface ComponentGroupVO {
  id?: number
  groupName: string
  numSort?: number
  parentId?: number
}

export interface ComponentTableVO {
  id: number,
  groupId: number,
  componentName: string,
  componentCode: string,
  status: number,
}


export interface ComponentAttributeVO {
  id: number,
  componentId: number,
  attributeName: string,
  attributeType: string,
  attributeValue: string,
  addComponentAttribute: any,
  updateComponentAttribute: any,
  delComponentAttribute: any,
}

export const api = "/cfg/component-group/";


// 查询分组树形列表
export const getTree = (deptId, name,selected) => {
  return request.get({url: '/system/dept/select/list?deptId=' + (deptId ? deptId : '') + (name ?'&name=' + name : '') + (selected ?'&userIds=' + selected : '')});
}



