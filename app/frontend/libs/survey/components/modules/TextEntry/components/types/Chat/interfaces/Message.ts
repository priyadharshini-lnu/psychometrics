export type MessageType = 'mine' | 'their'

export default interface Message {
  text: string
  position: number
  type: MessageType
}
