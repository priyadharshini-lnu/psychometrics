export interface Factor {
  id: string
  name: string
  score_types: {
    [x: string]: string[]
  }[],
}
