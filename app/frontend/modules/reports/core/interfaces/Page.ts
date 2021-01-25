
export default interface Page {
  id: number
  name: string
  modules: number[]
  removed: boolean

  toJSON: () => {}
}
