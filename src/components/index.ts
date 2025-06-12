import type { App } from 'vue'
import { Icon } from './Icon'
import { JVxeTable } from '@/components/JVxeTable'
import Render from '@/components/Render/index'
import CodeInput from '@/components/CodeInput/index.vue'

import {
  AceSelect,
  AceInput,
  AceRadio,
  AceSelectTabsTable,
  AceSelectTabsTableV2,
  AceInputNumber,
  AceInputCurrency,
  AceDatePicker,
  AceDateRangePicker,
  AceDatetimePicker,
  AceDatetimeRangePicker,
  AceInputNumberRange,
  AceCheckBox,
  AceSelectTable,
  AceCascader,
  AceDetail,
  AceTextarea,
  AceAreaSelect,
  AceAutocomplete,
  AceSwitch,
  AceAgreement,
  AceInputPrefixed
} from '@/components/ace'

import {
  SelectTrustTree,
  SelectDept,
  SelectUser,
  SelectRoleUser,
  SelectRole,
  SelectCommonUser,
  SelectTreeDict,
  SelectChooseUser,
  CascaderDict,
  SelectBank,
  SelectTrader,
  SelectDialog,
  WorkFlowLink,
  AttachmentButton
} from '@/components-yt'

export const setupGlobCom = (app: App<Element>): void => {
  app.component('Icon', Icon)

  app.component('JVxeTable', JVxeTable)
  app.component('CodeInput', CodeInput)

  app.component('AceSelect', AceSelect)

  app.component('AceInput', AceInput)
  app.component('AceInputNumber', AceInputNumber)
  app.component('AceInputCurrency', AceInputCurrency)

  app.component('AceRadio', AceRadio)
  app.component('AceCheckBox', AceCheckBox)
  app.component('AceDatePicker', AceDatePicker)
  app.component('AceDateRangePicker', AceDateRangePicker)
  app.component('AceDatetimePicker', AceDatetimePicker)
  app.component('AceDatetimeRangePicker', AceDatetimeRangePicker)
  app.component('AceInputNumberRange', AceInputNumberRange)
  app.component('AceCascader', AceCascader)
  app.component('AceAreaSelect', AceAreaSelect)
  app.component('AceAutocomplete', AceAutocomplete)
  app.component('AceSwitch', AceSwitch)

  app.component('AceSelectTabsTable', AceSelectTabsTable)
  app.component('AceSelectTabsTableV2', AceSelectTabsTableV2)
  app.component('AceSelectTable', AceSelectTable)
  app.component('AceDetail', AceDetail)
  app.component('AceTextarea', AceTextarea)
  app.component('AceAgreement', AceAgreement)
  app.component('AceInputPrefixed', AceInputPrefixed)

  app.component('Render', Render)

  app.component('BizSelectTrustTree', SelectTrustTree)
  app.component('BizSelectDept', SelectDept)
  app.component('BizSelectUser', SelectUser)
  app.component('BizSelectRoleUser', SelectRoleUser)
  app.component('BizSelectRole', SelectRole)
  app.component('BizSelectCommonUser', SelectCommonUser)
  app.component('BizSelectTreeDict', SelectTreeDict)
  app.component('BizSelectChooseUser', SelectChooseUser)
  app.component('BizCascaderDict', CascaderDict)
  app.component('BizSelectBank', SelectBank)
  app.component('BizSelectTrader', SelectTrader)
  app.component('BizSelectDialog', SelectDialog)
  app.component('BizWorkFlowLink', WorkFlowLink)
  app.component('BizAttachmentButton', AttachmentButton)
}
