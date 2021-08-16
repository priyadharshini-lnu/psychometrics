import { BasePreviewModel, BasePropertiesModel } from './Base'

export interface PreviewModel extends BasePreviewModel<Props, 'Table'> {}

export interface PropertiesModel extends BasePropertiesModel<Props, 'Table'> {}

interface Props {
  columnsCount: number
  rowsCount: number
  gapType: GapType
  sourceType: 'Factor' | 'Question'
  filter: Array<number>
  questionsChoices: Array<{ questionId: number; choiceIds: Array<number> }>
  factorIds: Array<number>
}

export enum GapType {
  ALL = 0,
  POSITIVE = 1,
  NEGATIVE = 2,
}
