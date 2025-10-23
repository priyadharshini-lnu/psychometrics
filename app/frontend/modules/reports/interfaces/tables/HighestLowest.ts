import { BasePreviewModel, BasePropertiesModel } from './Base'

export interface PreviewModel extends BasePreviewModel<Props, 'Table'> {}

export interface PropertiesModel extends BasePropertiesModel<Props, 'Table'> {}

interface Props {
  sourceType: 'Factor' | 'Question'
  filter: number
  questionsChoices: Array<{ questionId: number; choiceIds: Array<number> }>
  factorIds: Array<number>
  sections: TableSectionsType
  tableStyle: TableStyleType
  hideValues: boolean
  noOfItems: number | null
  scoreCutoff: number | null
  skillType?: string[]
  currentJobFactors?: boolean
  targetJobFactors?: boolean
}

export enum TableSectionsType {
  ALL = 0,
  HIGHEST = 1,
  LOWEST = 2,
}

export enum TableStyleType {
  UNSTYLED = 'default',
  MINIMAL = 'minimal',
}
