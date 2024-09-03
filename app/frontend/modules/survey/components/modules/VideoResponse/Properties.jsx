import { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import { Button, InputNumber } from 'antd'
import InputDuration from '~/components/InputDuration'
import { DefaultTrackerOptions } from '~/modules/survey/constants/DefaultProps'
import styles from '~/modules/survey/views/PropertyPanel/components/PropertyPanel.less'
import ValidationTypes from '~/modules/survey/components/ValidationTypes'
import RequiredValidations from '~/modules/survey/components/RequiredValidations'

export class Properties extends Component {
  durations = [
    { value: 10, display: '10s' },
    { value: 30, display: '30s' },
    { value: 60, display: '1min' },
    { value: 90, display: '1min 30sec' },
    { value: 120, display: '2min' },
    { value: 180, display: '3min' },
    { value: 300, display: '5min' },
    { value: 600, display: '10min' },
  ]

  frameOptions = [
    { value: '', display: 'None' },
    { value: 'upperHalfBody', display: 'Upper Half Body' },
    { value: 'face', display: 'Full Face' },
    { value: 'custom', display: 'Custom' },
  ]

  static propTypes = {
    model: PropTypes.object.isRequired,
    restricted: PropTypes.bool,
  }

  update = () => {
    const { model } = this.props
    model.update()
  }

  changeDuration = (e) => {
    const { model } = this.props
    const duration = parseInt(e, 10)
    model.changeProps({ duration })
    this.update()
  }

  updateFitInFrame = (e) => {
    const { model } = this.props
    const fitInFrame = e.currentTarget.value
    const options = { ...DefaultTrackerOptions[fitInFrame] }

    if (fitInFrame === 'none') this.resetTrackerOptions()
    model.changeProps({ fitInFrame, trackerOptions: options })
    this.update()
  }

  resetTrackerOptions = () => {
    const { model, model: { props: { fitInFrame } } } = this.props
    model.changeProps({ trackerOptions: DefaultTrackerOptions[fitInFrame] || {} })
    this.update()
  }

  updateTrackerOptions = (val, object, key) => {
    const { model, model: { props: { fitInFrame, trackerOptions } } } = this.props
    const options = { ...(DefaultTrackerOptions[fitInFrame] || {}), ...trackerOptions }
    options[object][key] = val
    model.changeProps({ trackerOptions: options })
    this.update()
  }

  durationFields () {
    const { model } = this.props

    return (
      <div className={styles.fieldset} style={{ position: 'relative' }}>
        <span className={styles.label}>Max Duration</span>
        <InputDuration
          value={model.props.duration}
          maxDuration={600}
          onChange={this.changeDuration}
          placeholder={I18n.t('administration.components.input_duration.placeholder')}
        />
      </div>
    )
  }

  displayTrackerOptions () {
    const { model: { props: { fitInFrame, trackerOptions } } } = this.props

    if (!fitInFrame) return

    const { box, object } = { ...(DefaultTrackerOptions[fitInFrame] || {}), ...trackerOptions }
    return (
      <div className="">
        <div className={styles.fieldset} style={{ position: 'relative' }}>
          <div className={cs(styles.label, 'font-bold')}>Box</div>
          {Object.keys(box).map((key, i) => (
            <div key={i.toString()} className={cs(styles.numberInputWrapper, 'mbs')}>
              <label className={styles.label}>{key}</label>
              <InputNumber
                min={0.0}
                max={1.0}
                step={0.1}
                size="small"
                value={box[key]}
                precision={2}
                disabled={fitInFrame !== 'custom'}
                onChange={e => this.updateTrackerOptions(e, 'box', key)}
              />
            </div>
          ))}

          <div className={cs(styles.label, 'font-bold')}>Face</div>
          {Object.keys(object).map((key, i) => (
            <div key={i.toString()} className={cs(styles.numberInputWrapper, 'mbs')}>
              <label className={styles.label}>{key}</label>
              <InputNumber
                min={0.0}
                max={1.0}
                step={0.1}
                size="small"
                value={object[key]}
                precision={2}
                onChange={e => this.updateTrackerOptions(e, 'object', key)}
              />
            </div>
          ))}
        </div>
        <Button
          danger
          type="link"
          className="float-r ps"
          onClick={this.resetTrackerOptions}
        >
          Reset Defaults
        </Button>
      </div>
    )
  }

  frameFields () {
    const { model: { props: { fitInFrame } } } = this.props

    return (
      <div className={styles.fieldset} style={{ position: 'relative' }}>
        <div className={styles.label}>Fit In Frame</div>
        <select className="form-control" value={fitInFrame || ''} onChange={this.updateFitInFrame}>
          {this.frameOptions.map(o => (<option key={o.value} value={o.value}>{`${o.display}`}</option>))}
        </select>

        { this.displayTrackerOptions() }
      </div>
    )
  }

  renderVideoFields () {
    return (
      <div>
        { this.durationFields() }
        { this.frameFields() }
      </div>
    )
  }

  render () {
    const { model, restricted } = this.props
    return (
      <div>
        {this.renderVideoFields()}
        <hr className={styles.divider} />
        {!restricted && (
        <RequiredValidations
          model={model}
          update={() => this.forceUpdate()}
        />
        )}
        {!restricted && (
        <ValidationTypes
          model={model}
          update={() => this.forceUpdate()}
        />
        )}
      </div>
    )
  }
}
