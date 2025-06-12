/**
 * 根据tag获取字段数据
 * @param formData
 * @param pageListConfigs
 * @param tagNames
 */
export const getColumnsByTag=(formData,pageListConfigs,tagNames)=>{
  console.log(pageListConfigs)
  const tagField={}
  if (pageListConfigs) {
    pageListConfigs.forEach(item => {
      if (item.columnTag && Array.isArray(item.columnTag)) {
        const isTag=item.columnTag.some(item => tagNames.includes(item))
        if(isTag){
          // 获取字段后缀ID
          const moduleTableId = item.moduleTableId;
          // 从对应的数据对象中获取完整字段名的值
          if (formData[moduleTableId] && formData[moduleTableId][item.field]) {
            tagField[item.columnFieldAlias || item.columnName] = formData[moduleTableId][item.field];
          }
        }
      }
    })
  }
  return tagField
}

export const getTagsData=(formData,apiInfo,tagNames)=>{
  const tagData={}
  const tagDataField:any=[]
  const tableIdKeys:string[]=[]
  apiInfo.pageListConfigs.forEach(item => {
    if (item.columnTag && Array.isArray(item.columnTag)) {
      if(item.columnTag.some(item => tagNames.includes(item))){
        if(item.columnTagConfig){
          item.columnTagConfigObj=JSON.parse(item.columnTagConfig)
        }
        const tagItem={
          tableId:item.moduleTableId,
          isTable:!!item.childTableId,
          tagField:item.columnTagConfigObj?.fieldName || item.columnFieldAlias || item.columnName,
          field:item.field,
          tableName:'',
        }
        if(item.childTableId){
          const tableLayoutItem=apiInfo.tableLayoutConfig.find(layoutItem=>layoutItem.tableId===item.moduleTableId)
          if(tableLayoutItem && tableLayoutItem.defTableFieldName){
            tagItem.tableName=tableLayoutItem.defTableFieldName
          }else{
            const tableItem=apiInfo.moduleTables.find(tableItem=>tableItem.id===item.moduleTableId)
            tagItem.tableName=tableItem.tableName
          }
        }
        tagDataField.push(tagItem)
        tableIdKeys.push((item.childTableId ? 'list_':'') + item.moduleTableId)
      }
    }
  })
  console.log('tagDataField',tagDataField)
  //从formData中获取数据
  Object.keys(formData).forEach(key=>{
    //判断有对应表的标签
    if(tableIdKeys.includes(key)){
      //判断数据是对象还是列表
      if(Array.isArray(formData[key])){
        //列表类数据按照数组方式返回
        //获取子表中涉及标签的字段
        const tagChildTableKeys=tagDataField.filter(item=>item.tableId==key.replace('list_',''))
        if(tagChildTableKeys && tagChildTableKeys.length){
          const tableName=tagChildTableKeys[0].tableName
          //使用map方法对数组数据进行重组
          tagData[tableName] = formData[key].map(item=>{
            //使用reduce方法，使用标签的字段重组数组对象
            return tagChildTableKeys.reduce((pre,cur)=>{
              pre[cur.tagField]=item[cur.field]
              return pre
            },{})
          });
        }
      }else{
        //普通对象直接从对象中获取数据
        tagDataField.filter(item=>item.tableId==key).forEach((item)=>{
          tagData[item.tagField] = formData[key][item.field];
        })
      }
    }
  })
  console.log('tagData',tagData)
  //处理数组数据，转为对象逗号分隔
  let arrObj={}
  Object.keys(tagData).forEach(key=>{
    if(Array.isArray(tagData[key])){
      arrObj={...arrObj,...arrayToObject(tagData[key])}
    }
  })
  console.log('arrObj',arrObj)
  return {...tagData,...arrObj};
}
/**
 * 将数组转为按属性、逗号分隔的对象
 * @param arr
 */
export const arrayToObject=(arr)=>{
  const arrObj:any=[]
  arr.forEach(item=>{
    Object.keys(item).forEach(key=>{
      const arrObjItem=arrObj.find(objItem=>objItem.key==key)
      if(arrObjItem){
        arrObjItem.value.push(item[key])
      }else{
        arrObj.push({
          key:key,
          value:[item[key]]
        })
      }
    })
  })
  return arrObj.reduce((pre,cur)=>{
    pre[cur.key]=cur.value.join(',')
    return pre
  },{})
}
