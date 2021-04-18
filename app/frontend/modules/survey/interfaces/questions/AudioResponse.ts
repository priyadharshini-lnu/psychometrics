import {
  BaseQuestionProps,
  QuestionInBuilder,
  QuestionInPreview,
  QuestionInProperties,
} from './Base'

interface AudioQuestionBase {
  props: QuestionProps
}

export interface BuilderModel extends QuestionInBuilder, AudioQuestionBase {
  result: {
    answers: Array<{ media_id: number; value: string }>
  }
}

export interface PreviewModel extends QuestionInPreview, AudioQuestionBase {
  result: {
    answers: Array<{ media_id: number; value: string }>
  }
}

export interface PropertiesModel
  extends Omit<QuestionInProperties, 'props'>,
    AudioQuestionBase {
  changeProps(props: Partial<QuestionProps>): void
}

interface QuestionProps extends BaseQuestionProps {
  duration: number | null
}
