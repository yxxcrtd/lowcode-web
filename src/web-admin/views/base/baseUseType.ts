export interface btnDropItem {
  text: string,
  prop?: string,
  changeEventName?: string,
}

export interface tableColumnType {
  type?: string,
  width?: number,
  field?: string,
  title?: string,
  slot?: { name?: string, default?: string }
}
export interface anchorItemType {
  id:string,
  title: string,
  icon:string,
}
export interface tableFormColumnType {
  title: string,
  align?: string,
  field?: string,
  type?: string,
  width?: number,
  edit?:boolean,
  editType?:string,
}
