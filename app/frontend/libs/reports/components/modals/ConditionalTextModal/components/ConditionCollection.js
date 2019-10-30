import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ConditionTextStore from 'rb/store/modals/ConditionTextStore'
import styles from './ConditionalTextModal.scss'
import ConditionList from './ConditionList'
import moduleResults from './module_results'

class ConditionCollection extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  remove = () => {
    const { model } = this.props
    ConditionTextStore.module.removeConditionCollection(model)
    ConditionTextStore.update()
  }

  render () {
    const { model } = this.props
    const ResultComponent = moduleResults[model.module.type]
    return (
      <div className={styles.filterContainer}>
        <div className={styles.listWrapper}>
          <ConditionList model={model} onRemove={this.remove} />
        </div>
        <ResultComponent model={model} />
        <div className={styles.footer}>
          <a onClick={this.remove} className={styles.delete}>
            Delete
          </a>
        </div>
      </div>
    )
  }
}

export default ConditionCollection
