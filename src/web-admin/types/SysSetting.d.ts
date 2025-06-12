/**
 * 基础配置
 */
export type BaseConfig = {
  title: string
  keyword: string
  description?: string
  host: string
  logo: string
}

/**
 * 安全配置
 */
export type SafeConfig = {
  loginMethod: string
  verifyCode: string
  watermark: string
}

/**
 * 表单规范
 */
export type FormStandard = {
  labelWidth: string | number
  requireTagPosition: string
  formInline: string
  labelShowColon: string | boolean
}

/**
 * 表格规范
 */
export type TableStandard = {
  tableLine: string
  tableBeginIndex: string 
  tableStripes: string 
  tableFixedAction: string 
  tableActionPostion: string 
  tableDefPageSize: string | number
}

/**
 * 弹框规范
 */
export type DialogStandard = {
  dialogCanDrag: string | boolean
  dialogCanZoom: string | boolean
  dialogShowModal: string | boolean
  dialogCloseOnClickModal: string | boolean
  dialogCustomClass: string 
}

/**
 * 抽屉规范
 */
export type DrawerStandard = {
  drawerShowModal: string | boolean
  dialogCloseOnClickModal: string | boolean
  dialogCustomClass: string
}

/**
 * 主题配置
 */
export type ThemeConfig = {
  layout: string
  systemThemeColor: string
  headerThemeColor: string
  themeConfig?: string
}

/**
 * 字体配置
 */
export type ThemeFont = {
  font_style: string
  font_size: string | number
  font_color: string
  font_bold: string
  form_font_style: string
  form_font_size: string | number
  form_font_color: string
  form_font_bold: string
  card_font_style: string
  card_font_size: string | number
  card_font_color: string
  card_font_bold: string
}

/**
 * 字段类型配置
 */
export type DataSourceBase = {
  table_name_prefix: string
  table_name_rule: string
  field_name_prefix: string
  field_name_rule: string
  index_name_prefix: string
  index_name_rule: string
}