import { BasePreviewModel, BasePropertiesModel } from './Base'

export interface PreviewModel extends BasePreviewModel<Props, 'Graph'> {}

export interface PropertiesModel extends BasePropertiesModel<Props, 'Graph'> {}

interface Props {
  dataFormat: string
  graphicalRepresentation: string
  graphicalPosition: string
  legendPosition: string
  barBorderRadius: string
  maxValue: string | null
  source: {
    type: string
    id: string
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
}
