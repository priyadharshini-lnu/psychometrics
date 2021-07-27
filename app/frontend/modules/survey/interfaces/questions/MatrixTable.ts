import { BaseBuilderModel, BasePropertiesModel, BasePreviewModel } from './Base'

export interface BuilderModel
  extends BaseBuilderModel<Props, ModuleConfig, ArgsValidation> {}

export interface PropertiesModel
  extends BasePropertiesModel<Props, ModuleConfig> {}

export interface PreviewModel
  extends BasePreviewModel<Props, ModuleConfig, ArgsValidation> {}

interface Props {
  choicesTexts: Array<string>
}

interface ModuleConfig {
  moduleName: 'Matrix Table'
}

interface ArgsValidation {}
