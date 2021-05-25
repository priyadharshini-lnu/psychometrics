import {
  BaseBuilderModel,
  BasePropertiesModel,
  BasePreviewModel,
} from './Base'

export interface BuilderModel extends BaseBuilderModel<Props> {}

export interface PropertiesModel extends BasePropertiesModel<Props> {}

export interface PreviewModel extends BasePreviewModel<Props> {}

interface Props {
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
