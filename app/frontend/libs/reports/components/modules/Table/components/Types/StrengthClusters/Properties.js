import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'rb/store/PropertyPanelStore'
import AppStore from 'rb/store/AppStore'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFonts from 'rb/components/PropertyFonts'
import CPIFactorConditionStore from 'rb/store/modals/CPIFactorConditionStore'
import _ from 'lodash'
import Select from 'react-select'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

const ALL_FACTORS = 'All Factors'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  collectFactors = () => {
    const { model } = this.props
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    const factors = _.map(AppStore.mainFactors[dimensionId], this.factor)
    factors.unshift({ id: ALL_FACTORS, alias: ALL_FACTORS })
    return factors
  }

  allFactors = () => {
    const { model } = this.props
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    return _.map(model.filterFactors(AppStore.mainFactors[dimensionId]), this.factor)
  }

  factor = f => ({ id: f.id, alias: `${f.alias.substring(0, 24)}` })

  factorSelect = (factors) => {
    const { model } = this.props
    // add all
    if (_.find(factors, { id: ALL_FACTORS })) {
      factors = this.allFactors()
    }
    model.props.source = { factors }
    this.update()
  }

  update = () => {
    store.model.props.group = null
    store.model.update()
    this.forceUpdate()
  }

  openConditionModal = () => {
    CPIFactorConditionStore.open(store.model)
  }

  changeProp = (propName, e) => {
    store.model.props[propName] = parseInt(e.currentTarget.value, 10)
    store.model.update()
    this.forceUpdate()
  }

  changeOrder = () => {
    const { model } = store
    model.props.reverseOrder = !model.props.reverseOrder
    store.model.update()
    this.forceUpdate()
  }

  renderTopFactors () {
    return (
      <div>
        <span className={styles.label}>Factors</span>
        <Select
          name="form-field-name"
          value={getValue(this.collectFactors(), _.result(store.model, 'props.source.factors', 'Choose factor'))}
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
    const { model } = store
    return (
      <select onChange={e => this.changeProp('minPosition', e)} value={model.props.minPosition}>
        {_.times(model.props.maxPosition, i => <option value={i + 1} key={i}>{i + 1}</option>)}
      </select>
    )
  }

  renderMaxSelect () {
    const { model } = store
    const assessment = _.find(AppStore.assessments, { id: model.assessment_id })
    const dimensionId = assessment && assessment.dimensionId
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
    const { model } = store
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
        <div>Font</div>
        <PropertyFonts colors={false} />
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
