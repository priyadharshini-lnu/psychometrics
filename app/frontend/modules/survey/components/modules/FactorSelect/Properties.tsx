import { FC } from 'react'
import useForceUpdate from '~/hooks/useUpdate'
import { PropertiesModel } from '~/modules/survey/interfaces/questions/MultipleChoice'
import RequiredValidations from '~/modules/survey/components/RequiredValidations'
import ValidationTypes from '~/modules/survey/components/ValidationTypes'

export interface Props {
  model: PropertiesModel
  showOnlyTranslatable: boolean
}

export const Properties: FC<Props> = ({ model, showOnlyTranslatable }) => {
  const forceUpdate = useForceUpdate()

  if (showOnlyTranslatable) {
    return (
      <div>
        <ValidationTypes model={model} update={() => forceUpdate()} />
      </div>
    )
  }

  return (
    <div>
      <RequiredValidations model={model} update={() => forceUpdate()} />
      <ValidationTypes model={model} update={() => forceUpdate()} />
    </div>
  )
}
