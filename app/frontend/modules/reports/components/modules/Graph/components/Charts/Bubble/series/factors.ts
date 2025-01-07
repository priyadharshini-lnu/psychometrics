import reduce from 'lodash/reduce'

import { SeriesDataIdPoint } from '~/modules/reports/interfaces/graphs/Bubble'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFactorValue = (results: any, factor: number): number => {
  const factorResults = results.scoring?.[factor]
  if (factorResults && factorResults.results) {
    const sum = reduce(factorResults.results, (n, res) => res.getValue() + n, 0)
    return sum / factorResults.results.length
  }
  return 0
}

export const createFactorSeries = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any,
  seriesDataIdPoints: SeriesDataIdPoint[],
): SeriesDataIdPoint[] => {
  if (seriesDataIdPoints && seriesDataIdPoints.length !== 0) {
    const factorSeries = seriesDataIdPoints.map(serial => ({
      label: serial.label,
      x: getFactorValue(results, serial.x),
      y: getFactorValue(results, serial.y),
    }))
    return factorSeries
  }

  return []
}
