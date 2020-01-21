import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Buttons.scss'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    up: PropTypes.string,
    remove: PropTypes.func,
  }

  moveDown = () => {
    const {
      moveQuestionDown, block, blocksOrder, model,
    } = this.props
    moveQuestionDown(model, block, blocksOrder)
  }

  moveUp = () => {
    const {
      moveQuestionUp, block, blocksOrder, model,
    } = this.props
    moveQuestionUp(model, block, blocksOrder)
  }

  insertBottom = () => {
    const { insertAfterQuestion, model, block } = this.props
    insertAfterQuestion(block, model)
  }

  insertTop = () => {
    const { insertBeforeQuestion, model, block } = this.props
    insertBeforeQuestion(block, model)
  }

  render () {
    const {
      selected, up, remove,
    } = this.props

    return (
      <div onClick={e => e.stopPropagation()}>
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
