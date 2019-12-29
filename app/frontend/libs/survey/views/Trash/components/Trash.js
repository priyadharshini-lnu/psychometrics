import React, { Component } from 'react'
import styles from 'views/Block/components/Block.scss'
import Confirmation from 'components/Confirmation'
import FlipMove from 'react-flip-move'
import trashStyles from './Trash.scss'
import TrashItem from './TrashItem'

class Trash extends Component {
  state = {
    opened: true,
    showConfirmation: false,
    showDeleteConfirmation: false,
  }

  expand = () => {
    const { opened } = this.state
    this.setState({ opened: !opened })
  }

  showConfirmation = () => {
    this.setState({ showConfirmation: true })
  }

  onPermanentDelete = (type, model) => {
    this.setState({ showDeleteConfirmation: true, model, type })
  }

  onDeleteConfirm = () => {
    const { permanentRemoveBlock, permanentRemoveQuestion } = this.props
    const { type, model } = this.state
    this.setState({ showDeleteConfirmation: false })
    if (type === 'Block') {
      permanentRemoveBlock(model, type)
    }
    if (type === 'Question') {
      permanentRemoveQuestion(model, type)
    }
  }

  onConfirm = () => {
    const { emptyTrash } = this.props
    this.setState({ showConfirmation: false })
    emptyTrash()
  }

  onCancel = () => {
    this.setState({ showConfirmation: false, showDeleteConfirmation: false })
  }

  renderItem = (item, i) => {
    const { type } = item
    const { model } = item

    return !model.permanentRemove && (
      <TrashItem
        type={type}
        model={model}
        key={i}
        onPermanentDelete={this.onPermanentDelete}
        {...this.props}
      />
    )
  }

  render () {
    const { trash } = this.props
    const { showDeleteConfirmation, showConfirmation } = this.state
    const { opened } = this.state
    const iconClass = `fa fa-chevron-down ${styles.icon} ${opened ? '' : 'fa-rotate-270'}`

    return (
      <div className={styles.block} style={{ margin: '15px 205px 0 0' }}>
        <div className={styles.header}>
          <div className={styles.expander} onClick={this.expand}>
            <span className={iconClass} />
            <span className={styles.editable} onClick={this.edit}>Trash / Unused Questions</span>
          </div>
          <div className={styles.options}>
            <a className="btn btn-default" onClick={this.showConfirmation}>Empty Trash</a>
          </div>
        </div>
        <div className={[trashStyles.content]} style={{ display: opened ? 'block' : 'none' }}>
          <FlipMove typeName="ul" className="list-group border-bottom">
            {trash.map(this.renderItem)}
          </FlipMove>
        </div>
        <Confirmation show={showDeleteConfirmation} onConfirm={this.onDeleteConfirm} onCancel={this.onCancel}>
          <p>Are you sure you want to permanently remove?</p>
        </Confirmation>
        <Confirmation show={showConfirmation} onConfirm={this.onConfirm} onCancel={this.onCancel}>
          <p>Are you sure you want to empty the trash?</p>
        </Confirmation>
      </div>
    )
  }
}

export default Trash
