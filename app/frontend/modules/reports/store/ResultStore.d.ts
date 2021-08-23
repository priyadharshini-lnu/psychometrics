declare class ResultStore {
  constructor()

  realResults: boolean

  results: Record<
    number,
    {
      resultsByFilter: Record<
        number,
        {
          scoring: Record<
            number,
            {
              id: string
              name: string
              results: Array<{
                actualValue: number
                norm: number | null
                value: number
                getValue(): number
              }>
            }
          >
        }
      >
      getAverageFactorScore(filter: number): Array<{
        id: number
        avg: number
        name: string
      }>
      getTopFactorByRank(topPosition: number): {
        alias: string
        description: string
        icon: null | string
        id: number
        meanNormScore: number
        meanRawScore: number
      }
      getOccupationByRank(topPosition: number): {
        description: string
        factors: Array<{
          alias: string
          id: number
          meanRawScore: number
          position: number
        }>
        id: number
        name: string
        result: number
        stars: number
      }
    }
  >
}

export = new ResultStore()
