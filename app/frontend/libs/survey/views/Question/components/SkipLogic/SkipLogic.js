import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './SkipLogic.scss'
import Condition from './Condition'

class SkipLogicList extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  removeCondition = (index) => {
    const { model } = this.props
    model.skipLogic.splice(index, 1)
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model: { skipLogic }, model } = this.props

    if (skipLogic.length === 0) {
      return (<div />)
    }

    return (
      <div className={styles.skipLogicList}>
        {_.map(skipLogic, (condition, id) => (
          <Condition
            question={model}
            key={id}
            condition={condition}
            onRemove={this.removeCondition}
            index={id}
          />
        ))}
      </div>
    )
  }
}

export default SkipLogicList
