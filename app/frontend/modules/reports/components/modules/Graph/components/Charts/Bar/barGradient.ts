import { ColorType } from 'highcharts'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bar'
import { isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

type GradientDirection = NonNullable<PropertiesModel['props']['barGradient']>['direction']

type GradientCoordinates = {
  x1: number
  y1: number
  x2: number
  y2: number
}

type SeriesPoint = {
  color?: ColorType
  [key: string]: unknown
}

type SeriesItem = {
  color?: ColorType
  data?: Array<SeriesPoint | number | null>
  [key: string]: unknown
}

const VERTICAL_DIRECTION_COORDINATES: Record<GradientDirection, GradientCoordinates> = {
  top_to_bottom: {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
  },
  bottom_to_top: {
    x1: 0,
    y1: 1,
    x2: 0,
    y2: 0,
  },
  left_to_right: {
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 0,
  },
  right_to_left: {
    x1: 1,
    y1: 0,
    x2: 0,
    y2: 0,
  },
}

// Horizontal bars are drawn inside a plot group that Highcharts rotates by 90 degrees and mirrors
// (`rotate(90) scale(-1, 1)`), and gradient coordinates are resolved in that rotated space. Each
// direction therefore needs the coordinates of its rotated counterpart to run the requested way on
// screen, e.g. left to right is expressed as bottom to top.
const HORIZONTAL_DIRECTION_COORDINATES: Record<GradientDirection, GradientCoordinates> = {
  top_to_bottom: {
    x1: 1,
    y1: 0,
    x2: 0,
    y2: 0,
  },
  bottom_to_top: {
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 0,
  },
  left_to_right: {
    x1: 0,
    y1: 1,
    x2: 0,
    y2: 0,
  },
  right_to_left: {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
  },
}

const isSeriesPoint = (point: SeriesPoint | number | null): point is SeriesPoint => (
  typeof point === 'object' && point !== null
)

const getGradientCoordinates = (
  direction: GradientDirection,
  graphicalPosition: string,
): GradientCoordinates => (graphicalPosition === 'Vertical'
  ? VERTICAL_DIRECTION_COORDINATES[direction]
  : HORIZONTAL_DIRECTION_COORDINATES[direction])

export const getBarGradientColor = (model: PropertiesModel): ColorType | undefined => {
  const { barGradient, textConditionType, graphicalPosition } = model.props

  if (!barGradient?.enabled || isGraphValueCondition(textConditionType)) {
    return undefined
  }

  return {
    linearGradient: getGradientCoordinates(barGradient.direction, graphicalPosition),
    stops: [
      [0, barGradient.startColor],
      [1, barGradient.endColor],
    ],
  }
}

export const getBarPaletteColors = (model: PropertiesModel): ColorType[] => {
  const gradientColor = getBarGradientColor(model)

  if (gradientColor) {
    return model.props.colors.map(() => getBarGradientColor(model) as ColorType)
  }

  return model.props.colors.map(colorObj => colorObj.color)
}

export const applyBarGradientToSeries = (series: SeriesItem[], model: PropertiesModel): SeriesItem[] => {
  const gradientColor = getBarGradientColor(model)

  if (!gradientColor) {
    return series
  }

  return series.map(seriesItem => ({
    ...seriesItem,
    color: getBarGradientColor(model),
    data: Array.isArray(seriesItem.data)
      ? seriesItem.data.map(point => (isSeriesPoint(point)
        ? { ...point, color: getBarGradientColor(model) }
        : point))
      : seriesItem.data,
  }))
}
