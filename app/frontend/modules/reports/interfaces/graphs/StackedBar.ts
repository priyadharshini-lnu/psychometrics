import { BasePreviewModel, BasePropertiesModel } from './Base'

export interface PreviewModel extends BasePreviewModel<Props, 'Graph'> {}

export interface PropertiesModel extends BasePropertiesModel<Props, 'Graph'> {}

interface Props {
  dataFormat: string
  graphicalPosition: string
  source: {
    type: string
    id: string
  }
  legendStyle: {
    fontSize: string
    fontColor: string
    fontFamily: string
  }
  showValues: boolean
  xAxisLinesHide: boolean
  yAxisLinesHide: boolean
  transparentBackground: boolean
  pointWidth: string
  showLegend: boolean
  hideYAxisTitle: boolean
  hideYaxisLabels: boolean
}
