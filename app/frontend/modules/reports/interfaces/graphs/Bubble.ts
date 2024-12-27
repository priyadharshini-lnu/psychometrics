import { BasePreviewModel, BasePropertiesModel } from './Base'

export interface PreviewModel extends BasePreviewModel<Props, 'Graph'> {}

export interface PropertiesModel extends BasePropertiesModel<Props, 'Graph'> {}

export type Size = {
  width: number
  height: number
}

export type SeriesDataIdPoint = {
  label: string
  x: number
  y: number
}

export type ColorsFromPallet = {
  id: number
  color: string
}

export type AdditionalChartOptions = {
  backgroundColor: string
  xMean: number
  xMeanTitle: string
  yMean: number
  yMeanTitle: string
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  colors: string[]
  size: Size
  bubbleSize: number
  yAxisLabelDisabled: boolean
  yAxisTitleDisabled: boolean
  yAxisLinesHide: boolean
}

type Props = {
  source: string
  seriesValueIds: SeriesDataIdPoint[]
  xMeanValueId: number
  yMeanValueId: number
  transparentBackground: false
  showLegend: boolean
  legendStyle: {
    fontSize: string
    fontColor: string
    fontFamily: string
  }
  xAxisLinesHide: boolean
  yAxisLinesHide: boolean
  yAxisTitleDisabled: boolean
  yAxisLabelDisabled: boolean
} & AdditionalChartOptions
