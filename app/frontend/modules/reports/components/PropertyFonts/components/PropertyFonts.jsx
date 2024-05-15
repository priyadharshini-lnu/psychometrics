import _ from 'lodash'
import { Component } from 'react'
import cs from 'classnames'
import { rgba2hex } from '~/utils/color'
import { ColorPicker } from '~/glint'
import DefaultProps from '~/modules/reports/consts/DefaultProps'
import styles from './PropertyFonts.less'

export const FONTS = {
  Arial: 'arial, helvetica, sans-serif',
  Comic: '"comic sans ms", cursive',
  Courier: '"courier new", courier, monospace',
  Gergia: 'georgia, serif',
  Impact: 'impact, charcoal, sans-serif',
  Lucida: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
  Monospace: 'monospace',
  'Sans Serif': '"ms sans-serif", geneva, sans-serif',
  'MS Serif': '"ms serif", "new york", sans-serif',
  Tahoma: 'tahoma, geneva, sans-serif',
  'Times New Roman': '"times new roman", times, serif',
  Trebuchet: '"trebuchet ms", helvetica, sans-serif',
  Verdana: 'verdana, geneva, sans-serif',
  Unifont: 'unifont, sans-serif',
}

const FONT_STEP_SIZE = 5
export const FONT_MIN_SIZE = 30
export const FONT_MAX_SIZE = 500

export const isDefault = (style, val) => _.isEqual(DefaultProps.Text.style[style], val)

export const getStyle = (styles, name) => {
  let style
  styles.forEach((s) => { style = _.get(s, ['styles', name]) })
  return style
}

export const isHasStyle = (styles, name) => {
  for (let i = 0; i < styles.length; i += 1) {
    if (_.get(styles[i], ['styles', name])) { return true }
  }

  return false
}

export const styleClassess = (textStyles, styleName, value) => {
  const hasStyle = isHasStyle(textStyles, styleName)
  return cs({
    [styles.hasStyle]: hasStyle,
    [styles.overriden]: hasStyle && overridenStyle(styleName === 'color' ? 'fontColor' : styleName, value),
  })
}

const overridenStyle = (style, value) => !isDefault(style, value)

class PropertyFilter extends Component {
  static propTypes = {}

  changeFontFamily = (e) => {
    const { model } = this.props
    model.props.style.fontFamily = e.currentTarget.value
    this.update()
  }

  changeFontSize = (e) => {
    const { model } = this.props
    model.props.style.fontSize = e.currentTarget.value
    this.update()
  }

  changeFontColor = (color) => {
    const { model } = this.props
    model.props.style.fontColor = color
    this.update()
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }


  renderFontFamily () {
    const { model, reportStyles } = this.props
    const textStyles = _.compact((model.props.styleIds || []).map(id => reportStyles[id]))
    const hasStyle = isHasStyle(textStyles, 'fontFamily')
    return (
      <select
        className={cs('form-control', styleClassess(textStyles, 'fontFamily', model.props.style.fontFamily))}
        value={model.props.style.fontFamily}
        onChange={this.changeFontFamily}
      >
        <option value="">{hasStyle ? 'Inherited' : 'Default'}</option>
        {_.map(FONTS, (value, key) => (<option key={key} value={value}>{key}</option>))}
      </select>
    )
  }

  renderFontSize () {
    const { model, reportStyles } = this.props
    const textStyles = _.compact((model.props.styleIds || []).map(id => reportStyles[id]))

    return (
      <select
        className={cs('form-control', styleClassess(textStyles, 'fontSize', model.props.style.fontSize))}
        value={model.props.style.fontSize}
        onChange={this.changeFontSize}
      >
        {_.times(1 + (FONT_MAX_SIZE - FONT_MIN_SIZE) / FONT_STEP_SIZE, i => (
          <option key={i} value={`${i * FONT_STEP_SIZE + FONT_MIN_SIZE}%`}>
            {i * FONT_STEP_SIZE + FONT_MIN_SIZE}
            %
          </option>
        ))}
      </select>
    )
  }

  renderFontColor () {
    const { model, reportStyles } = this.props
    const { fontColor } = model.props.style
    const notNullfontColor = fontColor || '#000000'
    const fontColorHex = typeof notNullfontColor === 'object'
      ? (rgba2hex(fontColor)) : notNullfontColor
    const textStyles = _.compact((model.props.styleIds || []).map(id => reportStyles[id]))

    return (
      <ColorPicker
        swatchClassName={cs(styles.swatch, styleClassess(textStyles, 'color', notNullfontColor))}
        getValueInHexFormat
        value={fontColorHex}
        onChange={this.changeFontColor}
        onComplete={this.update}
      />
    )
  }

  render () {
    const { colors } = this.props
    let output = (
      <div>
        {this.renderFontFamily()}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          {this.renderFontSize()}
          {this.renderFontColor()}
        </div>
      </div>
    )

    if (colors === false) {
      output = (
        <div>
          {this.renderFontFamily()}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {this.renderFontSize()}
          </div>
        </div>
      )
    }

    return output
  }
}

export default PropertyFilter
