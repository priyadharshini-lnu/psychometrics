import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Select from 'react-select'
import AppStore from '~/modules/reports/store/AppStore'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import connect from './connect'

const ALL_FACTORS = 'All Factors'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  collectFactors = () => {
    const { modules } = this.props
    const model = modules[0]
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    const factors = _.map(AppStore.mainFactors[dimensionId], this.factor)
    factors.unshift({ id: ALL_FACTORS, alias: ALL_FACTORS })
    return factors
  }

  allFactors = () => {
    const { modules } = this.props
    const model = modules[0]
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    return _.map(model.filterFactors(AppStore.mainFactors[dimensionId]), this.factor)
  }

  factor = f => ({ id: f.id, alias: `${f.alias.substring(0, 24)}` })

  factorSelect = (factors) => {
    const { modules } = this.props
    // add all
    if (_.find(factors, { id: ALL_FACTORS })) {
      factors = this.allFactors()
    }
    modules.forEach((model) => {
      model.props.source = { factors }
      model.props.group = null
      model.update()
    })
  }

  update = () => {
    const { model } = this.props
    model.props.group = null
    model.update()
  }

  openConditionModal = () => {
    const { modules, openConditionModal } = this.props
    openConditionModal({ modules })
  }

  changeProp = (propName, e) => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props[propName] = parseInt(e.currentTarget.value, 10)
      model.update()
    })
  }

  changeOrder = () => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.reverseOrder = !model.props.reverseOrder
      model.update()
    })
  }

  renderTopFactors () {
    const { modules } = this.props
    const model = modules[0]
    return (
      <div>
        <span className={styles.label}>Factors</span>
        <Select
          name="form-field-name"
          value={getValue(this.collectFactors(), _.result(model, 'props.source.factors', 'Choose factor'))}
          options={this.collectFactors()}
          getOptionValue={opt => opt.id}
          getOptionLabel={opt => opt.alias}
          autoFocus={false}
          isMulti
          onChange={this.factorSelect}
        />
      </div>
    )
  }

  renderMinSelect () {
    const { modules } = this.props
    const model = modules[0]
    return (
      <select onChange={e => this.changeProp('minPosition', e)} value={model.props.minPosition}>
        {_.times(model.props.maxPosition, i => <option value={i + 1} key={i}>{i + 1}</option>)}
      </select>
    )
  }

  renderMaxSelect () {
    const { modules } = this.props
    const model = modules[0]
    const assessment = _.find(AppStore.assessments, { id: model.assessment_id })
    const dimensionId = assessment && assessment.dimensionId
    if (!dimensionId) { return null }

    let max = AppStore.mainFactors[dimensionId].length + 1
    if (max < 6) { max = 6 }
    return (
      <select onChange={e => this.changeProp('maxPosition', e)} value={model.props.maxPosition}>
        {_.times(max - model.props.minPosition,
          i => <option value={i + model.props.minPosition} key={i}>{i + model.props.minPosition}</option>)}
      </select>
    )
  }

  render () {
    const { modules } = this.props
    const model = modules[0]
    return (
      <div>
        <div style={{ width: '100%' }} onClick={this.openConditionModal} className="btn btn-default margin-bottom-10">
          Manage conditions
        </div>
        {this.renderTopFactors()}
        <div className="margin-bottom-10">
          <span className={styles.label}>Top Positions (From-To)</span>
          <div className={styles.selectContainer}>
            {this.renderMinSelect()}
            {this.renderMaxSelect()}
          </div>
          <div className="margin-top-10">
            <label className={styles.inputLabel}>
              <input
                style={{ marginRight: '5px' }}
                type="checkbox"
                checked={model.props.reverseOrder || false}
                onChange={this.changeOrder}
              />
              Reverse order
            </label>
          </div>
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default connect(Properties)
