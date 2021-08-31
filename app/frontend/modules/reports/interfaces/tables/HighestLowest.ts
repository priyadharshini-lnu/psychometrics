import { BasePreviewModel, BasePropertiesModel } from './Base'

export interface PreviewModel extends BasePreviewModel<Props, 'Table'> {}

export interface PropertiesModel extends BasePropertiesModel<Props, 'Table'> {}

interface Props {
  sourceType: 'Factor' | 'Question'
  filter: number
  questionsChoices: Array<{ questionId: number; choiceIds: Array<number> }>
  factorIds: Array<number>
}
