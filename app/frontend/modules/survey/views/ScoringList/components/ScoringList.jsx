import { Component } from 'react'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import Scoring from '~/modules/survey/views/Scoring'
import styles from './ScoringList.less'

export class ScoringList extends Component {
  renderScoring () {
    const {
      blocks, type, scorings, recoding,
    } = this.props
    return (
      <div className={styles.main}>
        {blocks.map((block, i) => (
          <div className={`panel panel-default ${styles.blockContainer}`} key={i}>
            <div className="panel-heading">{block.name}</div>
            <div className="panel-body">
              {block.questions.map((question, j) => (
                <Scoring
                  type={type}
                  key={j}
                  model={QuestionSerializer.wrap(question)}
                  scorings={scorings}
                  recoding={recoding}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderError () {
    return (
      <div>Relative dimension has not factors for scoring</div>
    )
  }

  render () {
    const { selectedFactor } = this.props
    return (selectedFactor ? this.renderScoring() : this.renderError())
  }
}

export default ScoringList
