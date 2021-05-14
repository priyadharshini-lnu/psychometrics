import {
  BaseBuilderModel,
  BasePropertiesModel,
  BasePreviewModel,
  ModelProps,
  ChangeProps,
  BaseProps,
} from './Base'

export interface BuilderModel
  extends Omit<BaseBuilderModel, 'props'>,
    ChangeProps<Props>,
    ModelProps<Props> {}

export interface PropertiesModel
  extends Omit<BasePropertiesModel, 'props'>,
    ChangeProps<Props>,
    ModelProps<Props> {}

export interface PreviewModel
  extends Omit<BasePreviewModel, 'props'>,
    ModelProps<Props> {
  result?: {
    answers: Array<{ media_id: number; value: string }>
  }
}

interface Props extends BaseProps {
  duration: number | null
}
