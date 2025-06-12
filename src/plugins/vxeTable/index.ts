import type { App } from 'vue'
import VxeTable from 'vxe-table'
import 'vxe-table/lib/style.css'

export const setupVxeTable = (app: App<Element>) => {
  app.use(VxeTable)
}
