export interface Question {
  id: number
  deleted?: boolean
  type?: string
  display_logic?: object
  skip_logic?: object[]
  required_validation?: { enabled: boolean, type: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>
  hidden?: boolean
  isNeedToAddLtrManually?: boolean
  name?: string
  block_id?: number
}

export interface Block {
  id: number
  name: string
  questions: number[]
}
