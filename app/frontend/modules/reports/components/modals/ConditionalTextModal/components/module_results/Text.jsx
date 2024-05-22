import { Component } from 'react'
import { Select, Tag } from 'antd'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { ColorPicker } from '~/glint'
import { rgba2hex } from '~/utils/color'
import {
  FONTS, FONT_MIN_SIZE, FONT_MAX_SIZE,
} from '~/modules/reports/components/PropertyFonts/components/PropertyFonts'
import styles from '../ConditionalTextModal.less'
import { joinStyles, stylesPreview } from '~/modules/reports/components/modules/CommonMethods/styles'

export class ConditionCollection extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeText = (e) => {
    const { model } = this.props
    model.text = e.currentTarget.value
    this.forceUpdate()
  }

  changeFontFamily = (e) => {
    const { model } = this.props
    model.styles.fontFamily = e.currentTarget.value
    this.forceUpdate()
  }

  changeFontSize = (e) => {
    const { model } = this.props
    model.styles.fontSize = e.currentTarget.value
    this.forceUpdate()
  }

  changeFontColor = (color) => {
    const { model } = this.props
    model.styles.fontColor = color
    this.forceUpdate()
  }

  changeBg = (color) => {
    const { model } = this.props
    model.styles.backgroundColor = color
    this.forceUpdate()
  }

  changeBorder = (color) => {
    const { model } = this.props
    model.styles.borderColor = color
    this.forceUpdate()
  }

  changeStyles = (ids) => {
    const { model } = this.props
    model.styles.styleIds = ids
    this.forceUpdate()
  }

  removeStyle = (style) => {
    const { model } = this.props
    model.styles = _.omit(model.styles, style)
    this.forceUpdate()
  }

  renderFontFamily () {
    const { model } = this.props
    const { fontFamily } = model.styles
    return (
      <select className="form-control" value={fontFamily || 'Arial'} onChange={this.changeFontFamily}>
        {_.map(FONTS, (value, key) => (<option key={key} value={value}>{key}</option>))}
      </select>
    )
  }

  renderFontSize () {
    const { model } = this.props
    return (
      <select className="form-control" value={model.styles.fontSize || '100%'} onChange={this.changeFontSize}>
        {_.times(1 + (FONT_MAX_SIZE - FONT_MIN_SIZE) / 10, i => (
          <option key={i} value={`${i * 10 + FONT_MIN_SIZE}%`}>
            {i * 10 + FONT_MIN_SIZE}
            %
          </option>
        ))}
      </select>
    )
  }

  renderFontColor () {
    const { model } = this.props
    const { fontColor } = model.styles
    return (
      <ColorPicker getValueInHexFormat value={fontColor || '#ccc'} onChange={this.changeFontColor} />
    )
  }

  render () {
    const { model, reportStyles } = this.props
    const { fontColor, fontSize, fontFamily } = model.styles
    let { backgroundColor, borderColor } = model.styles
    backgroundColor = backgroundColor || {
      r: '238',
      g: '238',
      b: '238',
      a: '1',
    }

    borderColor = borderColor || {
      r: '170',
      g: '170',
      b: '170',
      a: '1',
    }

    const style = {
      backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`,
      borderColor: `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`,
      color: fontColor,
      fontSize,
      fontFamily,
    }


    return (
      <div ref={(ref) => { this.div = ref }}>
        Then show the following text:
        <textarea
          ref={(ref) => { this.textarea = ref }}
          className="form-control"
          value={model.text || ''}
          onChange={this.changeText}
          style={{ width: '100%', display: 'inline-block', ...style }}
        />
        <div className={styles.row}>
          <div className={styles.stylesBlock}>
            and apply the following styles:
            <div>
              {this.renderFontFamily()}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                {this.renderFontSize()}
                {this.renderFontColor()}
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.block} style={{ position: 'relative' }}>
                Background Color
                <ColorPicker value={rgba2hex(backgroundColor)} onChange={this.changeBg} />
              </div>
              <div className={styles.block} style={{ position: 'relative' }}>
                Border Color
                <ColorPicker value={rgba2hex(borderColor)} onChange={this.changeBorder} />
              </div>
            </div>
          </div>
          <div className={styles.stylesBlock} style={{ position: 'relative' }}>
            or following style sets
            <div style={{
              unset: 'all', width: 200, height: 50, ...stylesPreview(joinStyles(reportStyles, model.styles.styleIds)),
            }}
            />
            <Select
              mode="tags"
              size="small"
              showSearch
              getPopupContainer={() => this.div}
              filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              style={{ width: '100%', zIndex: 9999 }}
              value={model.styles.styleIds?.filter(s => reportStyles[s])}
              options={_.map(reportStyles, style => ({ value: style.id, label: style.name }))}
              tagRender={({ label, onClose }) => (
                <Tag color="green" closable onClose={onClose}>
                  {label}
                </Tag>
              )}
              onChange={this.changeStyles}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default ConditionCollection
