/* eslint-disable consistent-return */
import _ from 'lodash'
import React from 'react'
import { Scorings } from 'components/modules'
import FactorList from 'store/FactorList'
import AppStore from 'store/AppStore'
import { RECODING, SCORING } from 'constants/scoring'
import styles from './Scoring.scss'

export default function Scoring ({ model, type }) {
  const module = model.moduleConfig
  return (
    <div className={styles.questionContainer}>
      <div className={styles.infobar}>{model.name}</div>
      {module.scoring && !_.includes(module.scoringFilteredModules, model.props.type) ? (
        <ScoringType model={model} type={type} />
      ) : (
        <div>This question type is not currently supported</div>
      )}
    </div>
  )
}

const ScoringType = ({ model, type }) => {
  const getScoring = () => {
    if (type === SCORING) {
      return FactorList.scoring[model.id] || FactorList.addScoring({ question_id: model.id })
    }
    if (type === RECODING) {
      return AppStore.questionRecodingList.find(q => q.question_id === model.id)
              || AppStore.addQuestionRecoding({ question_id: model.id })
    }
  }

  const scoring = getScoring()
  scoring.setEngine(model.type)
  const View = Scorings[`${model.type}Scoring`] || Scorings.MultipleChoiceScoring
  return (
    <div>
      {(model.id && <View model={model} scoring={scoring} />) || (
        <div>Save Assessment for getting ability to manage Scoring</div>
      )}
    </div>
  )
}
