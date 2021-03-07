export interface Question {
  id: number
  block_id: number
  name: string
  position: number
  type: string
  props: {
    type: string
  }
  validation: {
    type: string
    args: Record<string, number | string>
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changeReqValidations: (newProps: Record<string, any>, undo?: boolean) => void
  requiredValidation: {
    enabled: boolean
    type: string
  }
  moduleConfig: {
    validations: boolean
  }
  update: () => void
}
