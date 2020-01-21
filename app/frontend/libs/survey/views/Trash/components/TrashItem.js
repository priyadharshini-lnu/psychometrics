import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Trash.scss'

class TrashItem extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    onPermanentDelete: PropTypes.func.isRequired,
  }

  restore = () => {
    const {
      restoreQuestion, restoreBlock, model, type,
    } = this.props
    if (type === 'Question') {
      restoreQuestion(model)
    }
    if (type === 'Block') {
      restoreBlock(model)
    }
  }

  permanentRemove = () => {
    const { onPermanentDelete, type, model } = this.props
    onPermanentDelete(type, model)
  }

  renderName = model => <span>{model.name}</span>

  render = () => {
    const { model } = this.props

    return (
      <li className={`list-group-item ${styles.noBorderRad}`}>
        <div className={styles.item}>
          <div className={styles.preview}>
            {this.renderName(model)}
          </div>
          <div className={styles.buttons}>
            <a onClick={this.restore} className="btn btn-success">Restore</a>
            <a onClick={this.permanentRemove} className="btn btn-danger">Permanently Delete</a>
          </div>
        </div>
      </li>
    )
  }
}

export default TrashItem
