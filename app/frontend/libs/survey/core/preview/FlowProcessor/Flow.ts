import Block from './types/Block'

interface FlowInterface {
  block: Block,
}
export default class Flow implements FlowInterface {
  block: Block

  constructor (params: object) {
  }
}
