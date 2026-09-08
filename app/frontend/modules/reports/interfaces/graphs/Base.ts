import { BaseProps } from '../Base'

export interface BasePreviewModel<Props = {}, T = ''> extends BaseModel<Props, T> {}

export interface BasePropertiesModel<Props = {}, T = ''> extends BaseModel<Props, T> {
  update: () => void
  getSourceType(): string
  getSourceModel(): SourceModel
  isMultiFiltering?: () => boolean
}

interface BaseModel<Props = {}, Type = ''> {
  id: number
  name: string | null
  position: number
  type: Type
  removed: boolean
  assessment_id: number
  propsshowValues: boolean
  props: BaseProps<Type> & Props
}

export type SourceModel = {
  name: string
}
