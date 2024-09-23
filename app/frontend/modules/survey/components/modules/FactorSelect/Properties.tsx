import { FC } from 'react'
import useForceUpdate from '~/hooks/useUpdate'
import { PropertiesModel } from '~/modules/survey/interfaces/questions/MultipleChoice'
import RequiredValidations from '~/modules/survey/components/RequiredValidations'
import ValidationTypes from '~/modules/survey/components/ValidationTypes'

export interface Props {
  model: PropertiesModel
}

export const Properties: FC<Props> = ({ model }) => {
  const forceUpdate = useForceUpdate()

  return (
    <div>
      <RequiredValidations model={model} update={() => forceUpdate()} />
      <ValidationTypes model={model} update={() => forceUpdate()} />
    </div>
  )
}
