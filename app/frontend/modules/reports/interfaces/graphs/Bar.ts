import { BasePreviewModel, BasePropertiesModel } from './Base'

export interface PreviewModel extends BasePreviewModel<Props, 'Graph'> {}

export interface PropertiesModel extends BasePropertiesModel<Props, 'Graph'> {}

type BarGradientDirection = 'top_to_bottom' | 'bottom_to_top' | 'left_to_right' | 'right_to_left'

type BarGradient = {
  enabled: boolean
  startColor: string
  endColor: string
  direction: BarGradientDirection
}

interface Props extends TextCondition {
  dataFormat: string
  graphicalRepresentation: string
  graphicalPosition: string
  legendPosition: string
  legendStyle: {
    fontSize: string
    fontColor: string
    fontFamily: string
  }
  barBorderRadius: string
  barBorderRadiusType: boolean
  maxValue: string | null
  yAxisInterval: string | null
  xAxisInterval: string | null
  gaugeWidth:number | null
  gaugeBorder:number | null
  source: {
    type: string
    id: string
    allFactors?: boolean
    subType?: 'default' | 'custom'
  }
  showLegend: boolean
  hideEmptyColumns: boolean
  hideZeroValueColumns: boolean
  barGradient: BarGradient
  showValues: boolean
  showValuesInsideBar: boolean
  valueLabelPosition?: 'center' | 'left' | 'right'
  preventValueOverlap: boolean
  xAxisLinesHide: boolean
  yAxisLinesHide: boolean
  xAxisLabelHide: boolean
  yAxisLabelHide: boolean
  hideEmptyFilters: boolean
  transparentBackground: boolean
  precision?: number
  hideLabel:boolean
  hideMarkers:boolean
  gaugePercentage: boolean
  rounded: boolean
  reverse: boolean
  customFactorValueFields?: string[]
  currentJobFactors?: boolean
  targetJobFactors?: boolean
  skillType?: string[]
}

export type TextCondition = {
  textConditionType?: 'default' | 'graph_value'
  graphValueConditions?: Array<{
    conditions: Array<Condition>
    color: string
  }>
}

type Condition = {
  prefix: string
  predicate: 'EqualTo' | 'NotEqualTo' | 'GreaterThan' | 'GreaterThanOrEqual' | 'LessThan' | 'LessThanOrEqual'
  value: number | null
}
