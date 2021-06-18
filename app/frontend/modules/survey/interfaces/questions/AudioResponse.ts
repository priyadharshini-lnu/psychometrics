import { BaseBuilderModel, BasePropertiesModel, BasePreviewModel } from './Base'

export interface BuilderModel extends BaseBuilderModel<Props> {}

export interface PropertiesModel extends BasePropertiesModel<Props> {}

export interface PreviewModel extends BasePreviewModel<Props> {
  result?: {
    answers: Array<{ media_id: number; value: string }>
  }
}

interface Props {
  duration: number | null
}
