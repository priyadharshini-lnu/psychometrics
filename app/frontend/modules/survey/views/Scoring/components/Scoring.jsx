/* eslint-disable consistent-return */
import _ from 'lodash'
import { RECODING, SCORING } from '~/modules/survey/constants/scoring'
import { Scorings } from '~/modules/survey/components/modules'
import styles from './Scoring.less'

export default function Scoring ({ model, type, ...props }) {
  const module = model.moduleConfig
  return (
    <div className={styles.questionContainer}>
      <div className={styles.infobar}>{model.name}</div>
      {module.scoring && !_.includes(module.scoringFilteredModules, model.props.type) ? (
        <ScoringType model={model} type={type} {...props} />
      ) : (
        <div>This question type is not currently supported</div>
      )}
    </div>
  )
}

const ScoringType = ({
  scorings, recoding, model, type,
}) => {
  const getScoring = () => {
    if (type === SCORING) {
      return scorings[model.id]
    }
    if (type === RECODING) {
      return recoding.find(q => q.question_id === model.id)
    }
  }
  const scoring = getScoring()
  if (!scoring) { return null }
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
