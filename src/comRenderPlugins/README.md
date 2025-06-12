# 常用脚本方法汇总

### 区间日期校验
```javascript
function customValidate(rule,value,callback,formData){
    //自定义校验必须返回callback，参考elementPlus官方文档
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】或具体结构【formData[1894191348934537217][PROJECT_NAME_1894191348934537217]】格式
    console.log('custvalidate',rule,value,callback,formData)
    if(value && value.length){
        if(#SET_UP_DATE# && new Date(#SET_UP_DATE#)>new Date(value[0])){
            callback(new Error('闲置资金期限  需要在范围：[产品成立日期，预计到期日期]'))
            return
        }
        if(#PRED_END_DATE# && new Date(#PRED_END_DATE#)<new Date(value[1])){
            callback(new Error('闲置资金期限  需要在范围：[产品成立日期，预计到期日期]'))
            return
        }
    }
    callback()
}

```

### 闲置资金运用流程  闲置资金与列表总和校验
```javascript
function customValidate(rule,value,callback,formData){
        //自定义校验必须返回callback，参考elementPlus官方文档
        //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】或具体结构【formData[1894191348934537217][PROJECT_NAME_1894191348934537217]】格式
        console.log('custvalidate',rule,value,callback,formData)
        const totalAmt=formData['list_1902932281066909697'].reduce((pre,cur)=>{
            return pre+Number(cur['INVEST_AMOUNT_1902932281066909697'] || 0)
        },0)
        if(value && totalAmt>0 && Number(value)<totalAmt){
            callback(new Error('闲置资金金额需大于列表拟投资金额汇总和'))
            return
        }
        callback()
    }
```

### 触发其他表单项校验
```javascript
function handleEvent(ctx,fieldConfig,formData,data,renderUtil){
    //ctx为页面上下文
    //fieldConfig 当前字段的配置信息
    //data 当前组件事件返回的数据
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】或
    //具体结构【formData[1894191348934537217][PROJECT_NAME_1894191348934537217]】格式
    console.log('change',ctx,fieldConfig,formData,data)
    ctx.exposed.validateFields([fieldConfig.moduleTableId+'.IDLE_TERM'])
}

```

### 后补事项 行内其他说明字段添加自定义校验
```javascript
function customValidate(rule,value,callback,col,row,rowIndex){
    //自定义校验必须返回callback，参考elementPlus官方文档
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】或具体结构【row[1894191348934537217][PROJECT_NAME_1894191348934537217]】格式
  if (row['SUPPLEMENT_FILE_'+col.moduleTableId] == '3' && !value) {
            callback(new Error('请输入其他说明'))
        } else { 
            callback() 
        }
}

```

### 后补事项  行内自定义事件 触发行内表单校验
```javascript
function handleEvent(ctx,fieldConfig,formData,data,renderUtil){
    //ctx为页面上下文
    //fieldConfig 当前字段的配置信息
    //data 当前组件事件返回的数据
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】或
    //具体结构【formData[1894191348934537217][PROJECT_NAME_1894191348934537217]】格式
    console.log('change',ctx,fieldConfig,formData,data)
  const fields=[]
  fields.push(`['list_1894567608940523522'][${data.rowIndex}].OTHER_EXPLAIN_1894567608940523522`)
   ctx.exposed.validateFields(fields)
}

```

### 自定义事件 保存前  快速论证，总经理、董事长、董事会节点更新字段
```javascript
function customEvent(ctx,apiInfo,formData,flowNodeInfo,renderUtil){
    //ctx为页面上下文
    //apiInfo 页面当前配置信息
    //formData 表单信息
    //formData为当前表单数据,调用字段可以使用模板字符串【#字段名#】
    //或具体结构【formData[1894191348934537217][PROJECT_NAME_1894191348934537217]】格式
    //渲染引擎公共方法库
    console.log('customEvent',ctx,apiInfo,flowNodeInfo,formData)
    if(flowNodeInfo && ['2201','2202','2203'].includes(flowNodeInfo.nodeId)){
        #APPROVE_PASS_DATE#=renderUtil.getCurDate('YYYY-MM-DD hh:mm:ss')
    }
}

```

###  行内自定义事件 附件是否必填
```javascript
function handleEvent(ctx,fieldConfig,formData,data,renderUtil){
    //ctx为页面上下文
    //fieldConfig 当前字段的配置信息
    //附件必填类型
    //必填状态
  if(#PROPERTY_NATURE# === '2'){
    renderUtil.fileValidate(ctx,formData,[],{isRequire:1,oriAttachmentId:"1909150824972230657",fileType:'LEVEL2_1608',fileTypeText:'信息披露 / 资产运营报告'},)
  }else if(#PROPERTY_NATURE# === '3'){
    renderUtil.fileValidate(ctx,formData,[],{isRequire:1,oriAttachmentId:"1909150824972230657",fileType:'LEVEL2_1608',fileTypeText:'信息披露 / 资金管理报告 或 信息披露 / 资产运营报告'},)
  }else{
    renderUtil.fileValidate(ctx,formData,[],{isRequire:1,oriAttachmentId:"1909150824972230657",fileType:'LEVEL2_1602',fileTypeText:'信息披露 / 资金管理报告'},)
  }
}
```
### 拓展事件 配置弹框
```javascript
async function customEvent(ctx,apiInfo,formData,flowNodeInfo,renderUtil){
    console.log('customEvent',ctx,apiInfo,flowNodeInfo,formData)
    if((!flowNodeInfo || flowNodeInfo.nodeId=='2308') && formData['1880173453502136322']['PROJECT_MAIN_CATEGORY_1880173453502136322']=='2'){
        //【开办状态】为“待提交/审批中/作废”，弹框提示：产品引用的资产未完成开办，确认提交审批？
        let checkItem=formData['list_1904740580070383618'].find(item=>['1','2','3'].includes(item['OPEN_STATUS_1904740580070383618']))
        if(checkItem){
            await renderUtil.messageUtil('confirm','产品引用的资产未完成开办，确认提交审批？')
        }
        //【运用合同签署状态】为“待提交；审批中；已作废；已审批未签署”，弹框提示：产品引用的非标资产运用合同未完成签署，确认提交审批？
        checkItem=formData['list_1904740580070383618'].find(item=>['1','2','3','5'].includes(item['CONTRACT_SIGNING_STATUS_1904740580070383618']))
        if(checkItem){
            await renderUtil.messageUtil('confirm','产品引用的非标资产运用合同未完成签署，确认提交审批？')
        }
        //若【合同要素补录】为“未完成”，弹框提示：产品引用的非标资产运用合同要素补录未完成之前无法放款，确认提交审批？
        checkItem=formData['list_1904740580070383618'].find(item=>['2'].includes(item['CONTRACT_ELEMENT_SUPPLEMENT_1904740580070383618']))
        if(checkItem){
            await renderUtil.messageUtil('confirm','产品引用的非标资产运用合同要素补录未完成之前无法放款，确认提交审批？')
        }
    }
}
```

###  行内自定义事件 根据账户性质 账户类别自动生成表格数据
```javascript
function handleEvent(ctx,fieldConfig,formData,data,renderUtil){
    //ctx为页面上下文
    //fieldConfig 当前字段的配置信息
    renderUtil.generateTableData(ctx,formData,#ACCOUNT_NATURE#,#ACCOUNT_CATEGORY#,{formId:'1879819174148886529',tableId_2:'1879819174148886530',tableId_3:'1879819174153080834',tableId_4:'1879819174153080835'},1)
}
```
### 保存校验
```javascript
async function customEvent(ctx,apiInfo,formData,flowNodeInfo,renderUtil){
    console.log('customEvent',ctx,apiInfo,flowNodeInfo,formData)
    //判断节点
    if(!flowNodeInfo || flowNodeInfo.nodeId=='3635'){
        const propertyNature=formData['1893927138770055170']['PROPERTY_NATURE_1893927138770055170']//信托财产性质
        const singleCollectiveFlag=formData['1893927138770055170']['SINGLE_COLLECTIVE_FLAG_1893927138770055170']//单一集合标志
        const registFinishDate=formData['1893927138770055170']['REGIST_FINISH_DATE_1893927138770055170']//信托预登记完成日期
        const expectedSetUpDate=formData['1893927138770055170']['EXPECTED_SET_UP_DATE_1893927138770055170']//预计成立日期

        //判断 信托财产性质
        if(['2','3'].includes(propertyNature+'')){
            let valid=true
            //集合 预成立日期>=信托预登记完成日期+5
            if(singleCollectiveFlag=='2' && renderUtil.dayjsUtil(expectedSetUpDate).isBefore(renderUtil.dayjsUtil(registFinishDate).add('5','day'))){
                valid=false
                renderUtil.messageUtil('error','集合资金信托时，【预成立日期】必须大于等于【信托预登记完成日期】+5个自然日')
            }
            //单一 预成立日期>=信托预登记完成日期+2
            if(singleCollectiveFlag=='1' && renderUtil.dayjsUtil(expectedSetUpDate).isBefore(renderUtil.dayjsUtil(registFinishDate).add('2','day'))){
                valid=false
                renderUtil.messageUtil('error','集合资金信托时，【预成立日期】必须大于等于【信托预登记完成日期】+2个自然日')
            }
            if(!valid){
                return false
            }
        }
    }
}
```
### 日期加6个月+10个工作日
```javascript
async function handleEvent(ctx,fieldConfig,formData,data,renderUtil){
    //ctx为页面上下文
    //fieldConfig 当前字段的配置信息
    if(#REGIST_DATE#){
      const date =  renderUtil.dayjsUtil(#REGIST_DATE#).add('6','month').format('YYYY-MM-DD')
      #CODE_REG_EFFECT_DATE# = await renderUtil.defRequest('/ibps/projectCenter/projBasicInfo/getDateForWork',{curDate:date,day:10,referenceCalendar:'1'})
    }else{
      #CODE_REG_EFFECT_DATE# = ''
    }
}
```
###校验表格日期
```javascript
if(row[`INVALID_DATE_${col.moduleTableId}`] && row[`EFFECT_DATE_${col.moduleTableId}`]){
    if(new Date(row[`EFFECT_DATE_${col.moduleTableId}`])>new Date(row[`INVALID_DATE_${col.moduleTableId}`])){
        callback(new Error('失效日期(不含)>生效日期(含)'))
        return
    }else{
        callback()
    }
}
callback()
```
###表格通过下拉框赋值
```javascript
console.log('change',ctx,fieldConfig,formData,data)
console.log('子产品编码',data.option.productNo)
console.log('期次',data.option.periodNumber)
console.log('发行方式',data.option.prodIssuingWay)
if(data.value){
    formData[`PRODUCT_NO_${fieldConfig.moduleTableId}`]=data.option.productNo
    formData[`PERIOD_NUMBER_${fieldConfig.moduleTableId}`]=data.option.periodNumber
    formData[`PROD_ISSUING_WAY_${fieldConfig.moduleTableId}`]=data.option.prodIssuingWay
}else{
    formData[`PRODUCT_NO_${fieldConfig.moduleTableId}`]=''
    formData[`PERIOD_NUMBER_${fieldConfig.moduleTableId}`]=''
    formData[`PROD_ISSUING_WAY_${fieldConfig.moduleTableId}`]=''
}
```