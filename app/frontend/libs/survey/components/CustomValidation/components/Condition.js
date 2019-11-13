import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'store/CustomValidationStore'
import QuestionCondition from 'libs/conditions'
import AppStore from 'store/AppStore'
import styles from './CustomValidation.scss'

export class Condition extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  changePrefix = (e) => {
    const { condition } = this.props
    const { value } = e.currentTarget
    condition.prefix = value
    this.forceUpdate()
  }

  add = () => {
    const { onAdd, condition } = this.props
    onAdd(condition)
  }

  remove = () => {
    const { onRemove, condition } = this.props
    if (store.model.validation.args.conditions.length > 1) {
      onRemove(condition)
    }
  }

  changeQuestionCondition = (cond) => {
    const { condition } = this.props
    condition.setData(cond)
    this.forceUpdate()
  }

  renderLogicType () {
    const { condition } = this.props
    const first = condition === store.model.validation.args.conditions[0]
    if (first) {
      return (
        <span className={styles.keyword}>if</span>
      )
    }

    return (
      <select value={condition.prefix} onChange={this.changePrefix} className={`form-control ${styles.prefix}`}>
        <option value="And">And if</option>
        <option value="Or">Or if</option>
      </select>
    )
  }

  render () {
    const { condition } = this.props
    return (
      <div className={styles.condition}>
        {this.renderLogicType()}
        <QuestionCondition
          questions={AppStore.questions}
          onChange={this.changeQuestionCondition}
          condition={condition}
        />
        <div className={styles.btns}>
          <span onClick={this.remove} className={`btn fa fa-minus-circle ${styles.btn}`} style={{ color: 'red' }} />
          <span onClick={this.add} className={`btn fa fa-plus-circle ${styles.btn}`} style={{ color: 'green' }} />
        </div>
      </div>
    )
  }
}

export default Condition
