import _ from 'lodash'
import BaseScoringModule from './BaseScoringModule'

class TextEntry extends BaseScoringModule {
  fill () {
    _.each(this.scoring.props, (object, index) => {
      object.value = index + 1
    })
  }

  changeValue (row, value) {
    if (value || value === 0) {
      const object = this.scoring.props[row]
      if (object) {
        object.value = value
      } else {
        this.scoring.props.push({ index: null, value })
      }
    }
    this.scoring.update()
  }

  changeIndex (row, value) {
    if (value || value === 0) {
      const object = this.scoring.props[row]
      if (object) {
        object.index = value
      } else {
        this.scoring.props.push({ index: value, value: null })
      }
    }
    this.scoring.update()
  }

  toggle (index) {
    const object = _.find(this.scoring.props, { index })
    if (object) {
      _.remove(this.scoring.props, { index })
    } else {
      this.scoring.props.push({ index, value: '1' })
    }
    this.scoring.update()
  }

  remove (row) {
    this.scoring.props.splice(row, 1)
    this.scoring.update()
  }

  add () {
    this.scoring.props.push({ index: null, value: null })
    this.scoring.update()
  }

  reset () {
    _.each(this.scoring.props, (object) => {
      object.value = null
    })
  }
}

export default TextEntry
