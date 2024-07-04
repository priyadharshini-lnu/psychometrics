import { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'
import cs from 'classnames'
import styles from './Buttons.less'

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
          <Button
            size="small"
            type="primary"
            icon={<span className={cs('fa fa-arrow-up', styles.btnicon)} />}
            onClick={this.moveUp}
            className={cs(styles.moveBtn, styles.up)}
          />
          <Button
            size="small"
            type="primary"
            icon={<span className={`fa fa-arrow-down ${styles.btnicon}`} />}
            onClick={this.moveDown}
            className={cs(styles.moveBtn, styles.down)}
          />
        </div>
        <div className={`${styles.right} ${up || ''}`} style={selected ? { right: 14 } : {}}>
          <Button
            size="small"
            type="primary"
            icon={<span className={`fa fa-plus ${styles.btnicon}`} />}
            onClick={this.insertTop}
            className={`${styles.btn}`}
          />
          <Button
            size="small"
            type="primary"
            danger
            icon={<span className={`fa fa-trash ${styles.btnicon}`} />}
            onClick={remove}
            className={`${styles.btn}`}
          />
          <Button
            size="small"
            type="primary"
            icon={<span className={`fa fa-plus ${styles.btnicon}`} />}
            onClick={this.insertBottom}
            className={`${styles.btn}`}
          />
        </div>
      </div>
    )
  }
}

export default Question
