import { SliderQuestion } from '~/modules/survey/components/modules/Components/SliderQuestion/SliderQuestion'

import Utils from '~/modules/survey/utils'

export const ConstantSumSlider = ({ model }) => {
  const { props } = model

  const changeValue = (i, value) => {
    props.fakeResults[i] = Utils.round(value, props.numberOfDecimals)
  }

  const changeLabel = (collection, i, text) => {
    model.changeArrayProps({ collection, i, val: text })
  }

  return <SliderQuestion model={model} changeValue={changeValue} changeLabel={changeLabel} />
}
