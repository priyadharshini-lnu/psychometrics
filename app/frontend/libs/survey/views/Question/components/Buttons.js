import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import styles from './Buttons.scss'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    up: PropTypes.string,
    remove: PropTypes.func,
  }

  moveDown = (e) => {
    const {
      moveQuestionDown, block, blocksOrder, model,
    } = this.props
    e.stopPropagation()
    moveQuestionDown(model, block, blocksOrder)
  }

  moveUp = (e) => {
    const {
      moveQuestionUp, block, blocksOrder, model,
    } = this.props
    e.stopPropagation()
    moveQuestionUp(model, block, blocksOrder)
  }

  insertBottom = (e) => {
    const { insertAfterQuestion, model, block } = this.props
    e.stopPropagation()
    insertAfterQuestion(block, model)
  }

  insertTop = (e) => {
    const { insertBeforeQuestion, model, block } = this.props
    e.stopPropagation()
    insertBeforeQuestion(block, model)
  }

  render () {
    const { model, up, remove } = this.props
    const selected = PropertyPanelStore.question === model

    return (
      <div>
        <div className={`${styles.left} ${up || ''}`}>
          <a onClick={this.moveUp} className={`btn btn-primary ${styles.moveBtn} ${styles.up}`}>
            <span className={`fa fa-arrow-up ${styles.btnicon}`} />
          </a>
          <a onClick={this.moveDown} className={`btn btn-primary ${styles.moveBtn} ${styles.down}`}>
            <span className={`fa fa-arrow-down ${styles.btnicon}`} />
          </a>
        </div>
        <div className={`${styles.right} ${up || ''}`} style={selected ? { right: 14 } : {}}>
          <a onClick={this.insertTop} className={`btn btn-success ${styles.addBtn}`}>
            <span className={`fa fa-plus ${styles.btnicon}`} />
          </a>
          <a onClick={remove} className={`btn btn-danger ${styles.addBtn}`}>
            <span className={`fa fa-minus ${styles.btnicon}`} />
          </a>
          <a onClick={this.insertBottom} className={`btn btn-success ${styles.addBtn}`}>
            <span className={`fa fa-plus ${styles.btnicon}`} />
          </a>
        </div>
      </div>
    )
  }
}

export default Question
