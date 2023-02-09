import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import { Alert } from 'antd'
import styles from './SkipLogic.less'
import Condition from './Condition'

class SkipLogicList extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  removeCondition = (condition) => {
    const { model, removeSkipLogic } = this.props
    removeSkipLogic(model, condition)
  }

  render () {
    const {
      model: { skip_logic: skipLogic }, model, blocks,
    } = this.props
    if (skipLogic.length === 0) {
      return (<div />)
    }

    const maybeShowNote = _.find(skipLogic, { destination: 'SpecificBlock' })

    return (
      <div className={styles.skipLogicList}>
        {maybeShowNote && (
          <Alert
            message="NOTE: Specific Block option under the
            Skip logic functionality is not working with configured Flow"
            type="warning"
          />
        )}
        {_.map(skipLogic, (condition, id) => (
          <Condition
            blocks={blocks}
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
