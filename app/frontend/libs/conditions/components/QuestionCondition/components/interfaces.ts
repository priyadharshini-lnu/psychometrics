export interface Condition {
  conditionType: string
  filterId: number
  subject: string
  prefix: string
  answer: string
  predicate: string
  type: string
  value: string
}

export interface Field {
  name: string,
  optionList: string[] | { [key: string]: string }
}
