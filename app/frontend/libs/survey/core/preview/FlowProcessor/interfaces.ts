export interface Question {
  id: number,
  deleted?: boolean,
  type?: string,
  display_logic?: object,
  skip_logic?: object[],
}

export interface Block {
  id: number,
  deleted?: boolean,
  questions: Question[]
  props?: { randomization? }
}

export interface BlocksInterface {
  blocks: Block[]
}
