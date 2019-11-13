import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InlineEditor from 'components/InlineEditor'
import styles from './EmbeddedData.scss'
import Controls from '../../Controls'

const DEFAULT_KEY = 'Enter Embedded Data Field Name Here...'
const DEFAULT_VALUE = 'Enter Embedded Data Field Value Here...'
class EmbeddedData extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  change = (index, key, value) => {
    const { model } = this.props
    model.props.storage[index][key] = value
    this.forceUpdate()
  }

  addValue = () => {
    const { model } = this.props
    model.props.storage.push({ key: null, value: null })
    this.forceUpdate()
  }

  render () {
    const {
      model, onRemove, onAddBelow, onDuplicate, onMove,
    } = this.props
    return (
      <div className={styles.block}>
        <div>
          <div className={styles.iconContainer}>
            <i className={`fa fa-database ${styles.icon}`} />
          </div>
          <div className={styles.title}>
            Set Embedded Data:
          </div>
        </div>
        <div className={styles.body}>
          {_.map(model.props.storage, (item, i) => (
            <div key={i}>
              <InlineEditor
                styles={styles.inplaceElement}
                value={item.key || DEFAULT_KEY}
                onChange={value => this.change(i, 'key', value)}
              />
              <span className={styles.delimiter}>=</span>
              <InlineEditor
                styles={styles.inplaceElement}
                value={item.value || DEFAULT_VALUE}
                onChange={value => this.change(i, 'value', value)}
              />
            </div>
          ))}
          <a onClick={this.addValue}>Add a New Field</a>
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

export default EmbeddedData
