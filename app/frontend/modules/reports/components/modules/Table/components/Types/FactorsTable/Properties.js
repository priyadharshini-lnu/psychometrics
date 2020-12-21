import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import AppStore from 'rb/store/AppStore'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFonts from 'rb/components/PropertyFonts'
import _ from 'lodash'
import Select from 'react-select'
import { getValue } from 'rb/presenters/ReactSelectPresenter'
import connect from './connect'
import SortableFactors from './SortableFactors'

const ALL_FACTORS = 'All Subfactors'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  collectFactors = () => {
    const { model } = this.props
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    const factors = _.map(AppStore.subfactors[dimensionId], this.factor)
    factors.unshift({ id: ALL_FACTORS, alias: ALL_FACTORS })
    return factors
  }

  allFactors = () => {
    const { model } = this.props
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    return _.map(model.filterFactors(AppStore.subfactors[dimensionId]), this.factor)
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
    const { model } = this.props
    model.props.group = null
    model.update()
  }

  openConditionModal = () => {
    const { model } = this.props
    const { openConditionModal } = this.props
    openConditionModal({ module: model })
  }

  changeProp = (propName, e) => {
    const { model } = this.props
    model.props[propName] = parseInt(e.currentTarget.value, 10)
    model.update()
  }

  changeOrder = () => {
    const { model } = this.props
    model.props.reverseOrder = !model.props.reverseOrder
    model.update()
    this.forceUpdate()
  }

  setProp = (propName, e) => {
    const { model } = this.props
    model.props[propName] = e.currentTarget.checked
    model.update()
  }

  changeMode = (e) => {
    const { model } = this.props
    model.props.mode = e.currentTarget.value
    model.update()
  }

  changeStyle = (propName, e) => {
    const { model } = this.props
    model.props[propName] = e.currentTarget.value
    model.update()
  }

  setSortedFactors = (factors) => {
    const { model } = this.props
    model.props.source = { factors }
    model.update()
  }

  renderTableModes () {
    const { model } = this.props
    const options = [
      { label: 'Top Factors', value: 'topFactors' },
      { label: 'Ordered Factors', value: 'orderedFactors' },
    ]

    return (
      options.map((option, i) => (
        <label className={styles.inputLabel} key={i}>
          <input
            className="mrs"
            type="radio"
            name="mode"
            value={option.value}
            checked={model.props.mode === option.value}
            onChange={this.changeMode}
          />
          {option.label}
        </label>
      ))
    )
  }

  renderTopFactors () {
    const { model } = this.props
    return (
      <div>
        <span className={styles.label}>Subfactors</span>
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
    const { model } = this.props
    return (
      <select onChange={e => this.changeProp('minPosition', e)} value={model.props.minPosition}>
        {_.times(model.props.maxPosition, i => <option value={i + 1} key={i}>{i + 1}</option>)}
      </select>
    )
  }

  renderMaxSelect () {
    const { model } = this.props
    const assessment = _.find(AppStore.assessments, { id: model.assessment_id })
    const dimensionId = assessment && assessment.dimensionId
    if (!dimensionId) { return null }
    let max = AppStore.subfactors[dimensionId].length + 1
    if (max < 6) { max = 6 }
    return (
      <select onChange={e => this.changeProp('maxPosition', e)} value={model.props.maxPosition}>
        {_.times(max - model.props.minPosition, i => (
          <option value={i + model.props.minPosition} key={i}>
            {i + model.props.minPosition}
          </option>
        ))}
      </select>
    )
  }

  renderStyleSelect () {
    const { model } = this.props
    const layouts = [
      { value: 'default', label: 'Default' },
      { value: 'compact', label: 'Compact' },
    ]

    return (
      <select onChange={e => this.changeStyle('tableStyle', e)} value={model.props.tableStyle || 'default'}>
        {layouts.map((layout, i) => (
          <option value={layout.value} key={i}>
            {layout.label}
          </option>
        ))}
      </select>
    )
  }

  renderTableOptions () {
    const { model, model: { props: { mode } } } = this.props
    const options = [
      { label: 'Header', prop: 'showHeader', default: false },
      {
        label: 'Rank',
        prop: 'showRankOrder',
        default: false,
        disabled: mode === 'orderedFactors',
      },
      { label: 'Score', prop: 'showScore', default: false },
      { label: 'Description', prop: 'showDescription', default: false },
      { label: 'Strengths & Blindspots', prop: 'showStrengthsBlindspots', default: false },
      { label: 'Icons', prop: 'showIcons', default: false },
    ]

    return (
      options.map((option, i) => (
        <label className={styles.inputLabel} key={i}>
          <input
            className="mrs"
            type="checkbox"
            checked={!option.disabled && _.get(model.props, option.prop, option.default)}
            onChange={e => this.setProp(option.prop, e)}
            disabled={option.disabled && option.disabled}
          />
          {option.label}
        </label>
      ))
    )
  }

  render () {
    const { model, model: { props: { mode, source: { factors } } } } = this.props

    return (
      <div>
        <div style={{ width: '100%' }} onClick={this.openConditionModal} className="btn btn-default margin-bottom-10">
          Manage conditions
        </div>
        <div className={styles.modes}>
          <span className={styles.label}>Modes</span>
          {this.renderTableModes()}
        </div>
        {this.renderTopFactors()}
        {mode === 'topFactors' && (
          <div className="margin-bottom-10">
            <span className={styles.label}>Top Positions (From-To)</span>
            <div className={styles.selectContainer}>
              {this.renderMinSelect()}
              {this.renderMaxSelect()}
            </div>
            <div className="margin-top-10">
              <label className={styles.inputLabel}>
                <input
                  className="mrs"
                  type="checkbox"
                  checked={model.props.reverseOrder || false}
                  onChange={this.changeOrder}
                />
                Reverse order
              </label>
            </div>
          </div>
        )}
        {mode === 'orderedFactors' && (
          <div className="mvs">
            <div className={cs(styles.label, 'mbm mtl')}>Factors Order</div>
            {factors && <SortableFactors selectedFactors={factors} update={this.setSortedFactors} />}
          </div>
        )}
        <hr className={styles.divider} />
        <div className="margin-top-10">
          <div className={cs(styles.label, 'mbm mtl')}>Show Elements</div>
          {this.renderTableOptions()}
        </div>
        <hr className={styles.divider} />
        <div>
          {'Style '}
          {this.renderStyleSelect()}
        </div>
        <hr className={styles.divider} />
        <div>Font</div>
        <PropertyFonts model={model} colors={false} />
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default connect(Properties)
