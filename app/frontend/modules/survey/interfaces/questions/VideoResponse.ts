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
    ChangeProps<Props>,
    ModelProps<Props> {}

interface Props extends BaseProps {
  duration: number
  trackerOptions: {
    box: {
      height: number
      width: number
    }
    object: {
      size: number
      threshold: number
    }
  }
  fitInFrame: string
}
