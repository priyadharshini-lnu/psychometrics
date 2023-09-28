import { Component } from 'react'
import PropTypes from 'prop-types'
import QuestionCondition from '~/libs/conditions'
import styles from './CustomValidation.less'

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
    const { onRemove, condition, validation } = this.props
    if (validation.conditions.length > 1) {
      onRemove(condition)
    }
  }

  changeQuestionCondition = (cond) => {
    const { condition } = this.props
    condition.setData(cond)
    this.forceUpdate()
  }

  renderLogicType () {
    const { condition, validation } = this.props
    const first = condition === validation.conditions[0]
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
    const { condition, questions } = this.props
    return (
      <div className={styles.condition}>
        {this.renderLogicType()}
        <QuestionCondition
          questions={questions}
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
