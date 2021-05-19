import {
  BasePropertiesModel, ModelProps, ChangeProps, BaseProps,
} from './Base'

export interface PropertiesModel
  extends Omit<BasePropertiesModel, 'props'>,
    ChangeProps<Props>,
    ModelProps<Props> {
  setChoices(choice: number): void
  resetDefaultValues(): void
}

interface Props extends BaseProps {
  position: 'Vertical' | 'Horizontal'
  notApplicable: boolean
  withImageChoice: boolean
  isImagePreviewEnable: boolean
  imageChoiceSize: 'small' | 'medium' | 'large'
}
