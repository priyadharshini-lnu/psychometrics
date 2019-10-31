import _ from 'lodash'
import BaseScoringModule from './BaseScoringModule'

class MultipleChoice extends BaseScoringModule {
  fill (question) {
    _.times(question.props.choices, (index) => {
      this.scoring.props.push({ index, value: index + 1 })
    })
  }

  changeValue (index, value) {
    if (value && value >= 0) {
      const object = _.find(this.scoring.props, { index })
      if (object) {
        object.value = value
      } else {
        this.scoring.props.push({ index, value })
      }
    } else {
      _.remove(this.scoring.props, { index })
    }
  }

  toggle (index) {
    const object = _.find(this.scoring.props, { index })
    if (object) {
      _.remove(this.scoring.props, { index })
    } else {
      this.scoring.props.push({ index, value: '1' })
    }
  }
}

export default MultipleChoice
