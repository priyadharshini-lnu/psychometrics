import { Component } from 'react'
import { Button } from 'antd'
import PropTypes from 'prop-types'
import styles from './Trash.less'

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

  render () {
    const { model } = this.props
    return (
      <li className={`list-group-item ${styles.noBorderRad}`}>
        <div className={styles.item}>
          <div className={styles.preview}>
            {this.renderName(model)}
          </div>
          <div className={styles.buttons}>
            <Button type="primary" onClick={this.restore}>Restore</Button>
            <Button type="primary" danger onClick={this.permanentRemove}>Permanently Delete</Button>
          </div>
        </div>
      </li>
    )
  }
}

export default TrashItem
