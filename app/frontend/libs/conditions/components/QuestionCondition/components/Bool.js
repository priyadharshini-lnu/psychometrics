import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './QuestionCondition.scss'

const PREDICATE = {
  Selected: 'Selected',
  NotSelected: 'Not Selected',
  Displayed: 'Displayed',
  NotDisplayed: 'Not Displayed',
}

export class Bool extends React.Component {
  propTypes = {
    condition: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    preview: PropTypes.bool,
  }

  changeType = (e) => {
    const { condition, onChange } = this.props
    condition.predicate = e.currentTarget.value
    onChange(condition)
  }

  renderSelect () {
    const { preview, condition } = this.props
    if (preview) {
      return <div>{condition.predicate}</div>
    }
    return (
      <select className="form-control" value={condition.predicate} onChange={this.changeType}>
        {!condition.predicate && <option />}
        {_.map(PREDICATE, (label, value) => (<option key={value} value={value}>{label}</option>))}
      </select>
    )
  }

  render () {
    const { preview } = this.props
    return (
      <div className={!preview && styles.predicates}>
        {this.renderSelect()}
        <div className={styles.empty} />
      </div>
    )
  }
}

export default Bool
