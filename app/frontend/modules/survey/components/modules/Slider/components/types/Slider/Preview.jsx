import { SliderQuestion } from '~/modules/survey/components/modules/Components/SliderQuestion/SliderQuestion'

export const SliderPreview = ({ model, I18n, readOnly }) => {
  const { props } = model
  const { numberOfDecimals } = props

  const changeValue = (choiceId, value) => {
    if (readOnly) {
      return
    }
    model.result.answer(choiceId, value, numberOfDecimals)
  }

  return <SliderQuestion readOnly={readOnly} model={model} I18n={I18n} preview changeValue={changeValue} />
}
