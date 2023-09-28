import { ChangeEvent, FC } from 'react'

import { BasePropertiesModel } from '~/modules/survey/interfaces/questions/Base'

import Utils from '~/modules/survey/utils'

import Content from './components/Content'
import Least from './components/Least'
import Most from './components/Most'
import Exact from './components/Exact'
import MaxLength from './components/MaxLength'
import MinLength from './components/MinLength'
import MustRankBetween from './components/MustRankBetween'
import MustTotal from './components/MustTotal'
import Range from './components/Range'

interface Props {
  model: BasePropertiesModel
  update: () => void
}

export const ValidationTypeFields: FC<Props> = ({ model, update }) => {
  const {
    moduleConfig,
    validation,
    validation: { type: validationType },
  } = model

  if (!moduleConfig.validations) {
    return null
  }

  const changeValidationArg = (event: ChangeEvent<HTMLInputElement>) => {
    const {
      currentTarget: { value, name },
    } = event

    if (validationType === 'Content' && name === 'type') {
      validation.args.type = value
    } else if (name) {
      validation.args[name] = Utils.parseFloat(value)
    }

    model.update()
    update()
  }

  const validationTypeFieldParams = {
    model,
    changeValidationArg,
  }

  if (validationType === 'Least' || validationType === 'LeastHotSpot') {
    return <Least {...validationTypeFieldParams} />
  }

  if (validationType === 'Most') {
    return <Most {...validationTypeFieldParams} />
  }

  if (validationType === 'Exact') {
    return <Exact {...validationTypeFieldParams} />
  }

  if (
    validationType === 'Range'
    || validationType === 'RangeHotSpot'
    || validationType === 'MustSelect'
    || validationType === 'EachGroupContains'
  ) {
    return <Range {...validationTypeFieldParams} />
  }

  if (validationType === 'MinLength' || validationType === 'MinWords') {
    return <MinLength {...validationTypeFieldParams} />
  }

  if (validationType === 'MaxLength' || validationType === 'MaxWords') {
    return <MaxLength {...validationTypeFieldParams} />
  }

  if (validationType === 'CharacterRange' || validationType === 'WordsRange') {
    return (
      <>
        <MinLength {...validationTypeFieldParams} />
        <MaxLength {...validationTypeFieldParams} />
      </>
    )
  }

  if (validationType === 'MustRankBetween') {
    return <MustRankBetween {...validationTypeFieldParams} />
  }

  if (validationType === 'MustTotal') {
    return <MustTotal {...validationTypeFieldParams} />
  }

  if (validationType === 'Content') {
    return <Content {...validationTypeFieldParams} />
  }

  return null
}
