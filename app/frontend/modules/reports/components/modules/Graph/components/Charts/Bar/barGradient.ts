import { ColorType } from 'highcharts'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bar'
import { isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'
import { tintTowardWhite } from '~/utils/color'

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

// How far the role colour is lightened toward white at the far end of a per-role gradient. The
// opacity stays fully opaque; only the shade changes, so the gradient reads as one hue going from a
// deeper to a lighter shade of itself. Kept small (half of a full lighten) so the shift is subtle.
const ROLE_GRADIENT_LIGHTEN_RATIO = 0.3

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

const isGradientEnabled = (model: PropertiesModel): boolean => {
  const { barGradient, textConditionType } = model.props
  return Boolean(barGradient?.enabled) && !isGraphValueCondition(textConditionType)
}

// True for multi-value charts — 360 and the other multi-filtering sources — which colour bars per
// role group.
export const isMultiSeriesGraph = (model: PropertiesModel): boolean => (
  typeof model.isMultiFiltering === 'function' && model.isMultiFiltering()
)

// Resolves a colour to something Highcharts can paint into an SVG gradient stop. The default
// start/end colours are CSS variables (e.g. `var(--ant-primary-6)`) which do not resolve inside
// `<stop stop-color>`, so we read their computed value off the document root.
const resolveColor = (color: string): string => {
  if (typeof color !== 'string' || !color.startsWith('var(')) {
    return color
  }
  const varName = color.slice(color.indexOf('(') + 1, color.lastIndexOf(')')).trim()
  if (typeof window === 'undefined' || !varName) {
    return color
  }
  const resolved = window.getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return resolved || color
}

const lightenShade = (color: string, ratio: number): string => {
  // Only hex colours can be shaded; anything else (rgb, named colour) is passed through unchanged
  // so the gradient still renders, just without a lighter stop at that end.
  if (typeof color !== 'string' || !color.startsWith('#')) {
    return color
  }
  return tintTowardWhite(color, ratio)
}

const buildGradient = (
  model: PropertiesModel,
  startColor: string,
  endColor: string,
): ColorType => ({
  linearGradient: getGradientCoordinates(model.props.barGradient.direction, model.props.graphicalPosition),
  stops: [
    [0, startColor],
    [1, endColor],
  ],
})

// Builds the gradient for a single role group / palette slot.
//
// Multi-series charts (360, and any other source that renders one series per role group) fade each
// bar from that role's own colour to a slightly lighter shade of the same hue, so every role keeps
// its own colour and stays distinguishable. The shared start/end colour pickers are hidden for
// these charts (see Properties) because they cannot apply per role, so they are not read here.
//
// Single-series charts have one series, so there is no per-role colour to preserve; they keep the
// original behaviour of fading from the user-picked start colour to the end colour.
const getGradientForColor = (
  model: PropertiesModel,
  isMulti: boolean,
  roleColor?: ColorType,
): ColorType | undefined => {
  if (!isGradientEnabled(model)) {
    return undefined
  }
  if (!isMulti) {
    const { startColor, endColor } = model.props.barGradient
    return buildGradient(model, resolveColor(startColor), resolveColor(endColor))
  }
  const baseColor = resolveColor(typeof roleColor === 'string' ? roleColor : model.props.barGradient.startColor)
  return buildGradient(model, baseColor, lightenShade(baseColor, ROLE_GRADIENT_LIGHTEN_RATIO))
}

// The chart-level `colors` fallback. When the gradient is on, every series is given an explicit
// gradient colour by applyBarGradientToSeries, so this fallback is shadowed and only needs to keep
// returning the plain palette colours (unchanged from the non-gradient behaviour).
export const getBarPaletteColors = (model: PropertiesModel): ColorType[] => (
  model.props.colors.map(colorObj => colorObj.color)
)

export const applyBarGradientToSeries = (series: SeriesItem[], model: PropertiesModel): SeriesItem[] => {
  if (!isGradientEnabled(model)) {
    return series
  }

  const isMulti = isMultiSeriesGraph(model) || series.length > 1
  const paletteColors = model.props.colors

  return series.map((seriesItem, index) => {
    const roleColor = (typeof seriesItem.color === 'string' ? seriesItem.color : undefined)
      ?? paletteColors[index]?.color
    const gradient = getGradientForColor(model, isMulti, roleColor)

    if (!gradient) {
      return seriesItem
    }

    return {
      ...seriesItem,
      color: gradient,
      data: Array.isArray(seriesItem.data)
        ? seriesItem.data.map(point => (isSeriesPoint(point) && point.color !== undefined
          ? { ...point, color: getGradientForColor(model, isMulti, point.color as ColorType) ?? gradient }
          : point))
        : seriesItem.data,
    }
  })
}
