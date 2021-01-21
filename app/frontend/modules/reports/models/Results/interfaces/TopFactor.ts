export enum TopFactorType {
  Any = 1,
  Factor = 2,
  SubFactor = 3,
}

export default interface TopFactor {
  meanRawScore: number
  meanNormScore: number
  id: number
  alias: string
  description: string
  icon: string
}
