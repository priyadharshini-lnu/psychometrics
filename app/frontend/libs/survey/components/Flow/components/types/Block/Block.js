import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Block.scss'
import Controls from '../../Controls'

class Block extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  state = {
    showQuestions: false,
  }

  changeBlock = (e) => {
    const { model } = this.props
    const val = e.currentTarget.value
    model.props.current = val
    this.forceUpdate()
  }

  toggleQuestions = () => {
    const { showQuestions } = this.state
    this.setState({ showQuestions: !showQuestions })
  }

  renderSelect () {
    const { blocks, model } = this.props
    return (
      <div className={`${styles.content} ${styles.selectContent}`}>
        <span className={styles.bold}>Show Block:</span>
        <select
          value={model.props.current || ''}
          onChange={this.changeBlock}
          className={`form-control ${styles.select}`}
        >
          <option>Select a block...</option>
          {_.map(blocks, block => <option key={block.id} value={block.id}>{block.name}</option>)}
        </select>
      </div>
    )
  }

  renderBlock (block) {
    const { questions } = this.props
    const { showQuestions } = this.state
    return (
      <div className={styles.content}>
        <div className={styles.labels}>
          <span className={styles.bold}>
            Show Block:
            {block.name}
          </span>
          <a className={styles.questionsCount} onClick={this.toggleQuestions}>
            (
            {block.questions.length}
            {' '}
            Questions)
          </a>
        </div>
        {showQuestions && (
        <div className={styles.questions}>
          {_.map(block.questions, (id) => {
            const question = _.find(questions, { id })
            return (
              <div key={id} className={styles.question}>
                <span className={styles.bold}>{question.name}</span>
                <span>{question.props.questionText}</span>
              </div>
            )
          })}
        </div>
        )}
      </div>
    )
  }

  render () {
    const {
      model, onRemove, onAddBelow, onDuplicate, onMove, blocks,
    } = this.props
    const current = _.find(blocks, { id: +model.props.current })
    return (
      <div>
        <div className={styles.row}>
          <span className={`fa fa-square ${styles.icon}`} />
          {current ? this.renderBlock(current) : this.renderSelect()}
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

export default Block
