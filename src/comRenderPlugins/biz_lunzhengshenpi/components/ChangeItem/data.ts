/**
 * 非标资产表格列定义
 */
export const nonStandardTableColumns=[
  {type:'checkbox',width: 60},
  {field: 'assetNo',title: '资产编号',align:'left',minWidth: 120},
  {field: 'assetName',title: '资产名称',align:'left',minWidth: 150},
  {field: 'bottomAssetOneAsText',title: '底层资产(一类)',align:'left',minWidth: 150},
  {field: 'bottomAssetTwoAsText',title: '底层资产(二类)',align:'left',minWidth: 150},
  {field: 'bottomAssetThreeAsText',title: '底层资产(三类)',align:'left',minWidth: 150},
  {field: 'approvalEndDate',title: '批复有效截止日期',align:'left',minWidth: 150},
  {field: 'inPoolStatus',title: '入池状态',align:'left',minWidth: 120},
  {field: 'openStatus',title: '开办状态',align:'left',minWidth: 120},
  {field: 'openStatus',title: '交易对手名称',align:'left',minWidth: 150},
  {field: 'totalQuota',title: '总额度(万元)',align:'right',minWidth: 120},
  {field: 'remainingQuota',title: '剩余额度(万元)',align:'right',minWidth: 150},
  {field: 'termType',title: '期限类型',align:'left',minWidth: 120},
  {field: 'totalTerm',title: '总期限(月)',align:'right',minWidth: 120},
  {field: 'productName',title: '资产运用计划到期日',align:'left',minWidth: 150},
]
/**
 * 标品资产表格列定义
 */
export const standardTableColumns=[
  {type:'checkbox',width: 60},
  {field: 'assetName',title: '资产编号',align:'left',minWidth: 120},
  {field: 'assetNo',title: '主体/资产名称',align:'left',minWidth: 120},
  {field: 'assetType',title: '资产类型',align:'left',minWidth: 120},
  {field: 'productName',title: '资产状态',align:'left',minWidth: 120},
  {field: 'productName',title: '入池方式',align:'left',minWidth: 120},
  {field: 'productName',title: '入池日期',align:'left',minWidth: 120},
  {field: 'productName',title: '项目经理',align:'left',minWidth: 120},
  {field: 'productName',title: '所属部门',align:'left',minWidth: 120}
]

export const internalTableColumns=[
  {type:'checkbox',width: 60},
  {field: 'projectCode',title: '信托产品代码',align:'left',minWidth: 120},
  {field: 'projectName',title: '信托产品全称',align:'left',minWidth: 150},
  {field: 'projStatusAsText',title: '产品状态',align:'left',minWidth: 120},
  {field: 'assetStatusAsText',title: '资产状态',align:'left',minWidth: 120},
  {field: 'trustThreeCategoryAsAllText',title: '信托业务分类',align:'left',minWidth: 150},
  {field: 'propertyNature',title: '信托财产性质',align:'left',minWidth: 120},
  {field: 'productName',title: '发行方式',align:'left',minWidth: 120},
  {field: 'issuingScaleTop',title: '发行规模(上限)(万元)',align:'left',minWidth: 150},
  {field: 'termTypeAsText',title: '期限类型',align:'left',minWidth: 120},
  {field: 'productName',title: '信托产品期限(下限)(月)',align:'right',minWidth: 150},
  {field: 'trustProductTermTop',title: '信托产品期限(上限)(月)',align:'left',minWidth: 150},
  {field: 'departName',title: '所属部门',align:'left',minWidth: 120},
  {field: 'trustManager',title: '第一产品经理',align:'left',minWidth: 150}
]
