import _ from 'lodash'
import BaseScoringModule from './BaseScoringModule'

class Slider extends BaseScoringModule {
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

  toggleReverse (index) {
    const object = _.find(this.scoring.props, { index })
    if (!object) { return }
    if (object.reverse) {
      _.unset(object, 'reverse')
    } else {
      _.set(object, 'reverse', true)
    }
  }

  toggleValue (index) {
    const object = _.find(this.scoring.props, { index })
    if (object) {
      _.remove(this.scoring.props, { index })
    } else {
      this.scoring.props.push({ index, value: '1' })
    }
  }

  toggle (index, reverse) {
    if (reverse) {
      this.toggleReverse(index)
    } else {
      this.toggleValue(index)
    }
  }
}

export default Slider
