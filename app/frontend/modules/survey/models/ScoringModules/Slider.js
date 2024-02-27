import _ from 'lodash'
import Utils from '~/modules/survey/utils'
import BaseScoringModule from './BaseScoringModule'

class Slider extends BaseScoringModule {
  fill (question) {
    _.times(question.props.choices, (index) => {
      this.scoring.props.push({ index, min: 1, max: 5 })
    })
  }

  changeValue (index, value, type) {
    if (Utils.isNumeric(value)) {
      const object = _.find(this.scoring.props, { index })
      if (object) {
        object[type] = value
      } else {
        this.scoring.props.push({ index, [type]: value })
      }
    } else {
      _.remove(this.scoring.props, { index })
    }
  }

  toggleValue (index) {
    const object = _.find(this.scoring.props, { index })
    if (object) {
      _.remove(this.scoring.props, { index })
    } else {
      this.scoring.props.push({ index, min: 1, max: 5 })
    }
  }

  toggle (index) {
    this.toggleValue(index)
  }

  isEmptyValues () {
    return !_.some(this.scoring.props, object => object.min !== undefined || object.max !== undefined)
  }
}

export default Slider
