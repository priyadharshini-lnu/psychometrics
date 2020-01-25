import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ChoicesInput from 'components/ChoicesInput'
import styles from './Randomizer.scss'
import Controls from '../../Controls'

class Randomizer extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  changeField = (val) => {
    const { model } = this.props
    if (model.elements.length >= val) {
      model.props.number = val
      this.forceUpdate()
    }
  }

  render () {
    const {
      model, onRemove, onAddBelow, onDuplicate, onMove,
    } = this.props
    return (
      <div className={styles.block}>
        <div>
          <div className={styles.iconContainer}>
            <i className={`fa fa-random ${styles.icon}`} />
          </div>
          <div className={styles.title}>
            Randomizer
          </div>
        </div>
        <div className={styles.body}>
          <div>Randomly present</div>
          <ChoicesInput
            value={model.props.number}
            onChange={this.changeField}
          />
          <div>of the following elements</div>
        </div>
        <div className={styles.footer}>
          <Controls
            styles={styles}
            onRemove={onRemove}
            onAddBelow={onAddBelow}
            onDuplicate={onDuplicate}
            onMove={onMove}
          />
        </div>
      </div>
    )
  }
}

export default Randomizer
