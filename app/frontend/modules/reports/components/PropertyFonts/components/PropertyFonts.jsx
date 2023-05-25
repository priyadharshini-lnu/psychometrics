import _ from 'lodash'
import { Component } from 'react'
import { ColorPicker } from '~/glint'

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
    model.props.style.fontColor = color.hex
    this.update()
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  renderFontFamily () {
    const { model } = this.props
    return (
      <select className="form-control" value={model.props.style.fontFamily} onChange={this.changeFontFamily}>
        {_.map(FONTS, (value, key) => (<option key={key} value={value}>{key}</option>))}
      </select>
    )
  }

  renderFontSize () {
    const { model } = this.props
    return (
      <select className="form-control" value={model.props.style.fontSize} onChange={this.changeFontSize}>
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
    const { model } = this.props
    const { fontColor } = model.props.style
    return (
      <ColorPicker color={fontColor} onChange={this.changeFontColor} onComplete={this.update} />
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
