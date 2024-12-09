import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../../Condition.less'
import embeddedStyles from './EvaluatorRelationship.less'

export default class EvaluatorRelationship extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  update = () => {
    const {
      model, index, condition, onUpdate,
    } = this.props
    const conditions = model.props.conditions.map((c, i) => (i === index ? condition : c))
    onUpdate({ ...model, props: { ...model.props, conditions } })
  }

  changePredicate = (e) => {
    const { condition } = this.props
    condition.predicate = e.currentTarget.value
    this.update()
  }

  changeValue = (e) => {
    const { condition } = this.props
    condition.value = e.currentTarget.value
    this.update()
  }

  render () {
    const { relationships, condition } = this.props
    return (
      <div className={styles.questionDock}>
        <select
          value={condition.predicate}
          className={`form-control ${embeddedStyles.predicateSelect}`}
          onChange={this.changePredicate}
        >
          <option value="EqualTo">Is</option>
          <option value="NotEqualTo">Is Not</option>
        </select>
        <select
          className={`form-control ${embeddedStyles.valueInput}`}
          value={condition.value || ''}
          onChange={this.changeValue}
        >
          <option />
          {relationships.map((relation, i) => <option key={i} value={relation.name}>{relation.name}</option>)}
        </select>
      </div>
    )
  }
}
