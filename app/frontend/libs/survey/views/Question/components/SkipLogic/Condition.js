import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import QuestionCondition from 'libs/conditions'
import styles from './SkipLogic.scss'

const DESTINATIONS = {
  EndOfBlock: 'End of Block',
  EndOfAssessment: 'End of Assessment',
  SpecificBlock: 'Specific Block',
}

export class Condition extends Component {
  static propTypes = {
    question: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  changeDestination = (e) => {
    const { question, condition } = this.props
    condition.destination = e.currentTarget.value
    question.update()
  }


  edit = () => {
    const { question, condition } = this.props
    condition.editMode = true
    question.update()
  }

  save = () => {
    const { condition, question } = this.props
    condition.editMode = false
    question.update()
  }

  remove = () => {
    const { onRemove, condition } = this.props
    onRemove(condition)
  }

  changeQuestionCondition = (cond) => {
    const { question, condition } = this.props
    condition.setData(cond)
    question.update()
  }

  changeDestinationBlock = (e) => {
    const { question, condition } = this.props
    condition.destinationBlock = e.currentTarget.value
    question.update()
  }

  renderCondition () {
    const { condition, question } = this.props
    return (
      <QuestionCondition
        preview={!condition.editMode}
        restricted
        questions={{ [question.id]: question }}
        onChange={this.changeQuestionCondition}
        condition={condition}
      />
    )
  }

  renderDestination () {
    const { condition, blocks } = this.props
    if (!condition.type) {
      return (<div className={styles.destination} />)
    }
    if (condition.editMode) {
      return (
        <div className={styles.destination}>
          <span className={styles.keyword}>Then Skip To</span>
          <select className="form-control" onChange={this.changeDestination} value={condition.destination}>
            <option />
            {_.map(DESTINATIONS, (label, value) => (<option key={value} value={value}>{label}</option>))}
          </select>
        </div>
      )
    }
    const block = _.find(blocks, { id: +condition.destinationBlock })
    return (
      <div className={styles.txt}>
        <span className={styles.keyword}>Then Skip To</span>
        {condition.destination === 'SpecificBlock'
          ? <div>{block ? block.name : ''}</div>
          : DESTINATIONS[condition.destination]}
      </div>
    )
  }

  renderControl () {
    const { condition, index } = this.props
    if (condition.editMode) {
      return (
        <div className={styles.control}>
          <button className="btn btn-success" onClick={this.save}>Save</button>
        </div>
      )
    }

    return (
      <div className={styles.control}>
        <DropdownButton
          className={styles.dropdown}
          bsStyle="default"
          title="Options"
          id={`block_menu_${index}`}
        >
          <MenuItem onSelect={this.edit}>
            <span className={styles.menuicon} />
            Edit Skip Logic...
          </MenuItem>
          <MenuItem onSelect={this.remove}>
            <span className={styles.menuicon} />
            Remove Skip Logic...
          </MenuItem>
        </DropdownButton>
      </div>
    )
  }

  renderBlockSelect () {
    const { condition, blocks } = this.props
    if (condition.destination !== 'SpecificBlock') { return null }

    if (condition.editMode) {
      return (
        <div className={styles.destinationSelect}>
          <select className="form-control" onChange={this.changeDestinationBlock} value={condition.destinationBlock}>
            <option>Select a block...</option>
            {_.map(blocks, block => (<option key={block.id} value={block.id}>{block.name}</option>))}
          </select>
        </div>
      )
    }

    return null
  }

  render () {
    const { condition } = this.props
    if (!condition.answer && !condition.editMode) {
      return (
        <div className={styles.condition}>
          <div className={styles.txt}>Invalid Skip Logic</div>
          {this.renderControl()}
        </div>
      )
    }

    return (
      <div className={styles.condition}>
        <span className={styles.keyword}>if</span>
        {this.renderCondition()}
        {this.renderDestination()}
        {this.renderBlockSelect()}
        {this.renderControl()}
      </div>
    )
  }
}

export default Condition
