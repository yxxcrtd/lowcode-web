import {useSelectUserStore} from "@/store/modules/selectUser";

/**
 * 设置组件的props
 * @param formItem
 * @returns {{}}
 */
export const setComponentProps = (formItem,component?,props?) => {
  //console.log(formItem,component,props)
  const propsData = formItem.props || {}
  if (formItem.columnDictType) {
    propsData.dict = formItem.columnDictType
  }
  //是否置灰
  propsData.disabled = !!formItem.isDisabled
  if(!props){
    props=formItem.columnComponentAttributeDO
  }
  //将组件属性设置到props中
  if(props && props.length){
    props.forEach((item) => {
      let attrValue=item.attributeValue
      if(attrValue==='true'){
        attrValue=true
      }
      if(attrValue==='false'){
        attrValue=false
      }
      if(attrValue===' '){
        attrValue=false
      }
      propsData[item.attributeCode]=attrValue
    })
  }
  if(!component){
    component=formItem.columnDisplayComponent
  }
  if(component == 'ace-select') {
    propsData.isAutoSelect=true
    if(propsData.multiple){
      propsData['isJoin']=true
    }
  }
  if(component=='ace-check-box'){
    propsData['isJoin']=true
  }
  //console.log(propsData,propsData)
  return propsData
}

export const preLoadComponentData=async ()=>{
  const selectUserStore = useSelectUserStore()
  // 获取数据
  await selectUserStore.getUserTreeData()
}
