import { Component } from 'react'
import PropTypes from 'prop-types'
import Utils from '~/modules/survey/utils'
import styles from './ScoringCell.less'

const defaultValue = '1'
class ScoringCell extends Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func,
  }

  select = (e) => {
    const { value, onChange } = this.props
    if (!Utils.isNumeric(value)) {
      onChange(defaultValue)
    }
    e.currentTarget.select()
  }

  render () {
    const { value, onChange } = this.props
    return (
      <input
        onFocus={this.select}
        onChange={onChange}
        placeholder="#"
        className={`${styles.ceil} ${Utils.isNumeric(value) ? styles.ceilFill : styles.ceilEmpty}`}
        value={Utils.isNumeric(value) ? value : ''}
      />
    )
  }
}
export default ScoringCell
