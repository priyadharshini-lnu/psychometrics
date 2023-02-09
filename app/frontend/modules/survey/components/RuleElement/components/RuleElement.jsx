import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import LogicElement from '~/modules/survey/components/LogicElement'
import styles from './RuleElement.less'

class RuleElement extends Component {
  static propTypes = {
    model: PropTypes.object,
  }

  changeType = (e) => {
    const { model } = this.props
    model.changeType(e.currentTarget.value)
    this.forceUpdate()
  }

  changeNorm = (e) => {
    const { model } = this.props
    model.norm_id = e.currentTarget.value
    this.forceUpdate()
  }

  remove = () => {
    const { removeNormRule, index } = this.props
    removeNormRule(index)
    this.forceUpdate()
  }

  renderTypeOptions () {
    const { model } = this.props
    return (
      <select className={`form-control ${styles.selectType}`} onChange={this.changeType} value={model.type}>
        {_.map(['Question', 'Hris'], type => (<option key={type} value={type}>{type}</option>))}
      </select>
    )
  }

  renderNormOptions () {
    const { model, norms } = this.props
    if (!norms.length) {
      return (
        <div className="alert alert-danger" style={{ float: 'none' }}>
          You need to add norm for this assessment and relative dimension
        </div>
      )
    }
    return (
      <div>
        <span className={styles.title}>Set Norm</span>
        <select className={styles.select} value={model.norm_id || ''} onChange={this.changeNorm}>
          {!model.norm_id && <option value="">Choose Norm</option>}
          {_.map(norms, norm => (<option key={norm.id} value={norm.id || ''}>{norm.name}</option>))}
        </select>
      </div>
    )
  }

  renderConditions () {
    const { model } = this.props

    if (!model.conditions) return null

    return (
      <LogicElement
        types={[
          'Question',
        ]}
        logic={model.conditions}
      />
    )
  }

  render () {
    return (
      <div className={styles.element}>
        <div className={styles.normContainer}>
          {this.renderNormOptions()}
        </div>
        <div className={styles.typeContainer}>
          {this.renderConditions()}
        </div>
        <div className={styles.footer}>
          <a onClick={this.remove} className={styles.delete}>Delete</a>
        </div>
      </div>
    )
  }
}

export default RuleElement
