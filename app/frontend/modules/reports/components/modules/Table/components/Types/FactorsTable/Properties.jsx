import { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import {
  InputNumber, Row, Col, Radio, Checkbox, Slider, Input, Space,
} from 'antd'
import _ from 'lodash'
import Select from 'react-select'
import AppStore from '~/modules/reports/store/AppStore'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { ColorPicker, HintCheckbox } from '~/glint'
import connect from './connect'
import SortableFactors from './SortableFactors'
import ScoreRangeList from './ScoreRangeList'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import PaginationOptions from '~/modules/reports/components/PaginationOptions'
import { RenderJobFactorModes, RenderSkillTypeModes } from '../../Properties'

const ALL_FACTORS = 'All Factors'
const { I18n } = window

class Properties extends Component {
  static propTypes = {
    modules: PropTypes.array.isRequired,
  }

  updateAll = (cb) => {
    const { modules } = this.props
    modules.forEach((module) => {
      cb?.(module)
      module.update()
    })
  }

  onChangeColor = (key, value) => {
    this.updateAll((module) => {
      module.props[key] = value
    })
  }

  setProp = (propName, e) => {
    this.updateAll((module) => {
      module.props[propName] = e.currentTarget.checked
    })
  }

  setSortedFactors = (factors) => {
    this.updateAll((module) => {
      module.props.source = { factors }
    })
  }

  allFactors = () => {
    const { modules } = this.props
    const model = modules[0]
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    return _.map(model.filterFactors(AppStore.factors[dimensionId]), this.factor)
  }

  collectFactors = () => {
    const { modules } = this.props
    const model = modules[0]

    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId
    let factors = AppStore.factors[dimensionId] || []

    const { skillType } = model.props

    // Apply skillType filtering if skillType is selected i.e Skill type
    if (skillType && skillType.length > 0) {
      factors = factors.filter(factor => skillType.includes(factor.skill_type))
    }

    const mappedFactors = _.map(factors, this.factor)
    mappedFactors.unshift({ id: ALL_FACTORS, alias: ALL_FACTORS })
    return mappedFactors
  }

  factor = f => ({ id: f.id, alias: `${(f.alias || f.name)?.substring(0, 24)}` })

  factorSelect = (factors) => {
    if (_.find(factors, { id: ALL_FACTORS })) {
      factors = this.allFactors()
    }
    this.updateAll((module) => {
      module.props.source = { factors }
    })
  }

  openConditionModal = () => {
    const { modules, openConditionModal } = this.props

    openConditionModal({ modules })
  }

  changeProp = (propName, e) => {
    const propValue = parseFloat(e.currentTarget.value, 10)
    this.updateAll((module) => {
      module.props[propName] = isNaN(propValue) ? null : propValue
    })
  }

  changeOrder = () => {
    this.updateAll((module) => {
      module.props.reverseOrder = !module.props.reverseOrder
    })
    this.forceUpdate()
  }

  changeMode = (e) => {
    this.updateAll((module) => {
      module.props.mode = e.currentTarget.value
    })
  }

  changeSkillType = (value) => {
    this.updateAll((module) => {
      module.props.skillType = value
      const factors = this.collectFactors()
      module.props.source = { factors }
    })
  }

  changeStyle = (propName, e) => {
    this.updateAll((module) => {
      module.props[propName] = e.currentTarget.value
    })
  }

  changePrecision = (val) => {
    this.updateAll((module) => {
      module.props.precision = val
    })
  }

  changeBenchmarkLabel = (e) => {
    this.updateAll((module) => {
      module.props.benchmarksLabel = e.currentTarget.value
    })
  }

  changeCurrentJobProficiencyLabel = (e) => {
    this.updateAll((module) => {
      module.props.currentJobProficiencyLabel = e.currentTarget.value
    })
  }

  changeTargetJobProficiencyLabel = (e) => {
    this.updateAll((module) => {
      module.props.targetJobProficiencyLabel = e.currentTarget.value
    })
  }

  changeAll = () => {
    this.updateAll((module) => {
      module.props.allFactors = !module.props.allFactors
    })
  }

  update = () => {
    this.updateAll((module) => {
      module.props.group = null
    })
  }

  renderTableModes () {
    const { modules } = this.props
    const model = modules[0]

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
            checked={model.props.mode === option.value || (!model.props.mode && option.value === 'topFactors')}
            onChange={this.changeMode}
          />
          {option.label}
        </label>
      ))
    )
  }

  renderTopFactors () {
    const { modules } = this.props
    const model = modules[0]

    return (
      <Space direction="vertical">
        <HintCheckbox
          label="All Factors"
          checked={model.props.allFactors}
          onChange={this.changeAll}
          hints={[
            'When checked, all factors will be displayed.',
            'When unchecked, only selected factors will be displayed.',
          ]}
        />
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
            style={{ width: '100%' }}
            onChange={this.factorSelect}
          />
        </div>
      </Space>
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
    let max = AppStore.factors[dimensionId].length + 1
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
    const { modules } = this.props
    const model = modules[0]

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

  renderScoreDisplaySelect () {
    const { modules } = this.props
    const model = modules[0]

    const layouts = [
      { value: 'circular', label: 'Circular' },
      { value: 'bullet', label: 'Bullet Graph' },
    ]

    return (
      <select onChange={e => this.changeStyle('scoreDisplay', e)} value={model.props.scoreDisplay || 'circular'}>
        {layouts.map((layout, i) => (
          <option value={layout.value} key={i}>
            {layout.label}
          </option>
        ))}
      </select>
    )
  }

  renderTableOptions () {
    const { modules } = this.props
    const model = modules[0]
    const { props: { mode } } = model
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })

    const options = [
      {
        label: I18n.t('administration.report_builder.property_panel.table_options.header'),
        prop: 'showHeader',
        default: false,
      },
      {
        label: I18n.t('administration.report_builder.property_panel.table_options.rank'),
        prop: 'showRankOrder',
        default: false,
        disabled: mode === 'orderedFactors',
      },
      {
        label: I18n.t('administration.report_builder.property_panel.table_options.score'),
        prop: 'showScore',
        default: false,
      },
      {
        label: I18n.t('administration.report_builder.property_panel.table_options.name'),
        prop: 'showName',
        default: false,
      },
      {
        label: I18n.t('administration.report_builder.property_panel.table_options.description'),
        prop: 'showDescription',
        default: false,
      },
      {
        label: I18n.t('administration.report_builder.property_panel.table_options.strengths_blindspots'),
        prop: 'showStrengthsBlindspots',
        default: false,
      },
      {
        label: I18n.t('administration.report_builder.property_panel.table_options.icons'),
        prop: 'showIcons',
        default: false,
      },
      {
        label: I18n.t('administration.report_builder.property_panel.table_options.label'),
        prop: 'showLabel',
        default: false,
      },
      {
        label: I18n.t('administration.report_builder.property_panel.table_options.border'),
        prop: 'showBorder',
        default: false,
      },
      {
        label: I18n.t('administration.report_builder.property_panel.table_options.show_benchmark_score'),
        prop: 'showBenchmarks',
        default: false,
      },
      ...(assessment?.isSkillRater ? [
        {
          label: I18n.t('administration.report_builder.property_panel.table_options.show_current_proficiency'),
          prop: 'showCurrentJobProficiency',
          default: false,
        },
        {
          label: I18n.t('administration.report_builder.property_panel.table_options.show_target_proficiency'),
          prop: 'showTargetJobProficiency',
          default: false,
        },
      ] : []),
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
    const { modules } = this.props
    const model = modules[0]
    const {
      props: {
        mode, tableStyle, showScore,
        scoreDisplay = 'circular',
        source: { factors },
      },
    } = model


    return (
      <div>
        <div style={{ width: '100%' }} onClick={this.openConditionModal} className="btn btn-default margin-bottom-10">
          Manage conditions
        </div>
        <div className={styles.modes}>
          <span className={styles.label}>Modes</span>
          {this.renderTableModes()}
          <RenderJobFactorModes modules={modules} />
          <RenderSkillTypeModes modules={modules} callback={this.changeSkillType} />
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
            <div className={cs(styles.label, 'mbs mtl')}>Score Range (&gt;= Min &lt; Max)</div>
            <div className={styles.selectContainer}>
              <Row gutter={8}>
                <Col flex={1}>
                  <InputNumber
                    size="small"
                    style={{ width: 82 }}
                    defaultValue={model.props.scoreRangeMin}
                    onBlur={e => this.changeProp('scoreRangeMin', e)}
                  />
                </Col>
                <Col flex={1}>
                  <InputNumber
                    size="small"
                    style={{ width: 82 }}
                    defaultValue={model.props.scoreRangeMax}
                    onBlur={e => this.changeProp('scoreRangeMax', e)}
                  />
                </Col>
              </Row>
            </div>
          </div>
        )}
        {mode === 'orderedFactors' && (
          <>
            <div className="mvs">
              <div className={cs(styles.label, 'mbm mtl')}>Factors Order</div>
              {factors && <SortableFactors selectedFactors={factors} update={this.setSortedFactors} />}
            </div>
            <div>
              <PropertyFilter modules={modules} />
            </div>
          </>

        )}
        <hr className={styles.divider} />
        <div className="margin-top-10">
          <div className={cs(styles.label, 'mbs mtl')}>Max Value</div>
          <InputNumber
            defaultValue={model.props.maxScoreValue}
            onBlur={e => this.changeProp('maxScoreValue', e)}
            size="small"
          />
        </div>
        <div className={styles.block} style={{ position: 'relative' }}>
          <div className="margin-top-10">Number Precision</div>
          <label className={styles.inputLabel}>
            <ChoicesInput
              value={model.props.precision}
              onChange={this.changePrecision}
              minValue={0}
              maxValue={9}
            />
          </label>
        </div>
        <hr className={styles.divider} />
        <div className="margin-top-10">
          <div className={cs(styles.label, 'mbm mtl')}>Show Elements</div>
          {this.renderTableOptions()}
          {model.props.showBenchmarks && (
            <div>
              <Input
                placeholder="Benchmark label"
                value={model.props.benchmarksLabel}
                onChange={this.changeBenchmarkLabel}
              />
            </div>
          )}
          {model.props.showCurrentJobProficiency && (
            <div className="mt-4">
              <Input
                placeholder="Current Proficiency label"
                value={model.props.currentJobProficiencyLabel}
                onChange={this.changeCurrentJobProficiencyLabel}
              />
            </div>
          )}
          {model.props.showTargetJobProficiency && (
            <div className="mt-4">
              <Input
                placeholder="Target Proficiency label"
                value={model.props.targetJobProficiencyLabel}
                onChange={this.changeTargetJobProficiencyLabel}
              />
            </div>
          )}

        </div>
        <hr className={styles.divider} />
        <div>
          {'Style '}
          {this.renderStyleSelect()}
        </div>
        <hr className={styles.divider} />
        <div className={styles.block}>
          Background Color
          <div className={styles.flexRow}>
            <ColorPicker
              value={model.props.backgroundColor}
              getValueInHexFormat
              onChange={color => this.onChangeColor('backgroundColor', color)}
            />
          </div>
        </div>
        {showScore && (
          tableStyle === 'default' && (
            <>
              <hr className={styles.divider} />
              <div>
                {'Score '}
                {this.renderScoreDisplaySelect()}
              </div>
            </>
          )
        )}
        {showScore && (
          tableStyle === 'default' && scoreDisplay === 'circular' && (
            <>
              <div className={styles.block}>
                Score Color
                <div className={styles.flexRow}>
                  <ColorPicker
                    getValueInHexFormat
                    value={model.props.scoreProgressColor}
                    onChange={color => this.onChangeColor('scoreProgressColor', color)}
                  />
                </div>
              </div>
              <div className={styles.block}>
                Score Background Color
                <div className={styles.flexRow}>
                  <ColorPicker
                    getValueInHexFormat
                    value={model.props.scoreBackgroundColor}
                    onChange={color => this.onChangeColor('scoreBackgroundColor', color)}
                  />
                </div>
              </div>
            </>
          )
        )}
        {showScore && (
          tableStyle === 'default' && scoreDisplay === 'bullet' && (
            <>
              <div className={styles.block}>
                <Checkbox
                  checked={model.props.showScoreText}
                  className={styles.radioLabel}
                  onChange={({ target: { checked } }) => {
                    this.onChangeColor('showScoreText', checked)
                  }}
                >
                  Show Score Text
                </Checkbox>
              </div>
              <ScoreRangeList modules={modules} />
              <div className={styles.block}>
                Bullet line height
                <Slider
                  min={1}
                  max={100}
                  onChange={value => this.onChangeColor('scoreBulletGraphHeight', +value)}
                  value={model.props.scoreBulletGraphHeight ? model.props.scoreBulletGraphHeight : 30}
                />
              </div>
            </>
          )
        )}
        {showScore && (
          <div className={styles.block}>
            Score Position
            <div className={styles.flexRow}>
              <Radio.Group
                onChange={({ target: { value } }) => {
                  this.onChangeColor('scorePosition', value)
                }}
                defaultValue={model.props.scorePosition || 'inline'}
              >
                <Radio value="inline" className={styles.radioLabel}>
                  Inline
                </Radio>
                <Radio value="block" className={styles.radioLabel}>
                  Block
                </Radio>
              </Radio.Group>
            </div>
          </div>
        )}
        {modules.length > 1 ? null
          : (
            <div className="mtm">
              <PaginationOptions module={model} onChange={this.onChangeColor} />
            </div>
          )}
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default connect(Properties)
