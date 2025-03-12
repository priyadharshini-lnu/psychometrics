import { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import {
  InputNumber, Row, Col, Radio, Checkbox, Slider,
  Space,
} from 'antd'
import _ from 'lodash'
import Select from 'react-select'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { ColorPicker } from '~/glint'
import connect from './connect'
import SortableFactors from './SortableCampaignFactors'
import ScoreRangeList from './ScoreRangeList'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import PaginationOptions from '~/modules/reports/components/PaginationOptions'

const ALL_FACTORS = 'All Campaign Factors'

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
    this.updateAll((model) => {
      model.props[key] = value
    })
  }

  setProp = (propName, e) => {
    this.updateAll((model) => {
      model.props[propName] = e.currentTarget.checked
    })
  }

  setSortedFactors = (campaignFactors) => {
    this.updateAll((model) => {
      model.props.source = { campaignFactors }
    })
  }

  collectCampaignFactors = () => {
    const { campaignFactors } = this.props
    if (!campaignFactors.length) return []
    return [...campaignFactors, { code: ALL_FACTORS, name: ALL_FACTORS }]
  }


  campaignFactorSelect = (selectedCampaignFactors) => {
    if (_.find(selectedCampaignFactors, { code: ALL_FACTORS })) {
      const { campaignFactors } = this.props
      selectedCampaignFactors = [...campaignFactors]
    }
    this.updateAll((model) => {
      model.props.source = { campaignFactors: selectedCampaignFactors }
    })
  }

  openConditionModal = () => {
    const { modules, openConditionModal } = this.props
    openConditionModal({ modules })
  }

  changeProp = (propName, e) => {
    const propValue = parseFloat(e.currentTarget.value, 10)
    this.updateAll((model) => {
      model.props[propName] = isNaN(propValue) ? null : propValue
      model.update()
    })
  }

  changeOrder = () => {
    this.updateAll((model) => {
      model.props.reverseOrder = !model.props.reverseOrder
      model.update()
    })
    this.forceUpdate()
  }

  changeMode = (e) => {
    this.updateAll((model) => {
      model.props.mode = e.currentTarget.value
    })
  }

  changeStyle = (propName, e) => {
    this.updateAll((model) => {
      model.props[propName] = e.currentTarget.value
    })
  }

  changePrecision = (val) => {
    this.updateAll((model) => {
      model.props.precision = val
    })
  }

  update = () => {
    this.updateAll((model) => {
      model.props.group = null
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
            checked={model.props.mode === option.value}
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
        <div>
          <span className={styles.label}>Factors</span>
          <Select
            name="form-field-name"
            value={getValue(this.collectCampaignFactors(),
              _.result(model, 'props.source.campaignFactors', 'Choose factor'), 'code')}
            options={this.collectCampaignFactors()}
            getOptionValue={opt => opt.code}
            getOptionLabel={opt => opt.name}
            autoFocus={false}
            isMulti
            onChange={this.campaignFactorSelect}
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
    const { modules, campaignFactors } = this.props
    const model = modules[0]
    if (!campaignFactors) { return null }
    let max = campaignFactors.length + 1
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
    const options = [
      { label: 'Header', prop: 'showHeader', default: false },
      {
        label: 'Rank',
        prop: 'showRankOrder',
        default: false,
        disabled: mode === 'orderedFactors',
      },
      { label: 'Score', prop: 'showScore', default: false },
      { label: 'Name', prop: 'showName', default: false },
      { label: 'Description', prop: 'showDescription', default: false },
      { label: 'Strengths & Blindspots', prop: 'showStrengthsBlindspots', default: false },
      { label: 'Icons', prop: 'showIcons', default: false },
      { label: 'Label', prop: 'showLabel', default: false },
      { label: 'Border', prop: 'showBorder', default: false },
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
        source: { campaignFactors },
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
              <div className={cs(styles.label, 'mbm mtl')}>Campaign Factors Order</div>
              {campaignFactors
                  && <SortableFactors selectedCampaignFactors={campaignFactors} update={this.setSortedFactors} />
              }
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
