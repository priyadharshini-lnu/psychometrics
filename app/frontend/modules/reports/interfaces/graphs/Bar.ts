import { BasePreviewModel, BasePropertiesModel } from './Base'

export interface PreviewModel extends BasePreviewModel<Props, 'Graph'> {}

export interface PropertiesModel extends BasePropertiesModel<Props, 'Graph'> {}

interface Props {
  dataFormat: string
  graphicalRepresentation: string
  graphicalPosition: string
  legendPosition: string
  barBorderRadius: string
  barBorderRadiusType: boolean
  maxValue: string | null
  gaugeWidth:number | null
  gaugeBorder:number | null
  source: {
    type: string
    id: string
    allFactors?: boolean
  }
  showLegend: boolean
  hideEmptyColumns: boolean
  hideZeroValueColumns: boolean
  showValues: boolean
  xAxisLinesHide: boolean
  yAxisLinesHide: boolean
  xAxisLabelHide: boolean
  yAxisLabelHide: boolean
  transparentBackground: boolean
  precision?: number
  hideLabel:boolean
  hideMarkers:boolean
  gaugePercentage: boolean
  rounded: boolean
}
