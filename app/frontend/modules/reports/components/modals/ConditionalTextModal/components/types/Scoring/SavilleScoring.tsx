import React from 'react'
import uniq from 'lodash/uniq'
import filter from 'lodash/filter'
import AppStore from '~/modules/reports/store/AppStore'
import useUpdate from '~/hooks/useUpdate'
import { Assessment } from '~/modules/reports/core/interfaces/Assessment'
import { Factor } from '~/modules/reports/core/interfaces/Factor'
import styles from '../../Condition.less'
import localStyles from './Scoring.less'

interface Props {
  model: {
    module: {
      assessment_id: number
    }
  }
  condition: {
    type: string
    props: {
      valueType: string
      factorId: string
      predicate: string
      value: string
    }
  }
}

export const SavilleScoring: React.FC<Props> = ({ model, condition }) => {
  const forceUpdate = useUpdate()

  const getScoreType = () => condition.type.replace('Saville#', '')

  const getAllValueTypes = (assessment: Assessment): string[] => {
    const scoreType = getScoreType()
    const valueTypes = assessment.factors.reduce((acc, factor) => {
      if (Object.keys(factor.score_types).includes(scoreType)) {
        return acc.concat(factor.score_types[scoreType])
      }
      return acc
    }, [])
    return uniq(valueTypes)
  }

  const getSavilleFactors = (assessment: Assessment) => {
    const { props: { valueType } } = condition
    const scoreType = getScoreType()

    return filter(assessment.factors, factor => (
      factor.score_types[scoreType] && factor.score_types[scoreType].includes(valueType)
    ))
  }

  const changeValueType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    condition.props.valueType = e.currentTarget.value
    forceUpdate()
  }

  const changeFactorId = (e: React.ChangeEvent<HTMLSelectElement>) => {
    condition.props.factorId = e.currentTarget.value
    forceUpdate()
  }

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    condition.props.value = e.currentTarget.value
    forceUpdate()
  }

  const changePredicate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    condition.props.predicate = e.currentTarget.value
    forceUpdate()
  }

  const { props: { value } } = condition
  const assessmentId = model.module.assessment_id
  const assessment = AppStore.getAssessmentById(assessmentId)

  return (
    <div className={styles.questionDock}>
      <select
        value={condition.props.valueType}
        onChange={changeValueType}
        className={`form-control ${localStyles.subjectSelect}`}
      >
        <option />
        {getAllValueTypes(assessment).map(valueType => (
          <option key={valueType} value={valueType}>{valueType}</option>
        ))}
      </select>
      <select
        value={condition.props.factorId}
        onChange={changeFactorId}
        className={`form-control ${localStyles.subjectSelect}`}
      >
        <option />
        {getSavilleFactors(assessment).map((factor: Factor) => (
          <option key={factor.id} value={factor.id}>{factor.name}</option>
        ))}
      </select>
      <select
        value={condition.props.predicate}
        onChange={changePredicate}
        className={`form-control ${localStyles.predicateSelect}`}
      >
        <option />
        <option value="EqualTo">Equal To</option>
        <option value="NotEqualTo">Not Equal To</option>
        <option value="GreaterThen">Greater Than</option>
        <option value="GreaterThenOrEqual">Greater Than Or Equal To</option>
        <option value="LessThen">Less Than</option>
        <option value="LessThenOrEqual">Less Than Or Equal To</option>
      </select>
      <input className={`form-control ${localStyles.subjectSelect}`} value={value} onChange={changeValue} />
    </div>
  )
}
