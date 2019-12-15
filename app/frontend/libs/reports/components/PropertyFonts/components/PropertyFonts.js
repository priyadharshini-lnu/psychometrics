import _ from 'lodash'
import React, { Component } from 'react'
import store from 'rb/store/PropertyPanelStore'
import ColorPicker from 'rb/components/ColorPicker'

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

export const FONT_MIN_SIZE = 30
export const FONT_MAX_SIZE = 500

class PropertyFilter extends Component {
  static propTypes = {}

  changeFontFamily = (e) => {
    store.model.props.style.fontFamily = e.currentTarget.value
    this.update()
  }

  changeFontSize = (e) => {
    store.model.props.style.fontSize = e.currentTarget.value
    this.update()
  }

  changeFontColor = (color) => {
    store.model.props.style.fontColor = color.hex
    this.update()
  }

  update = () => {
    store.model.update()
    this.forceUpdate()
  }

  renderFontFamily () {
    return (
      <select className="form-control" value={store.model.props.style.fontFamily} onChange={this.changeFontFamily}>
        {_.map(FONTS, (value, key) => (<option key={key} value={value}>{key}</option>))}
      </select>
    )
  }

  renderFontSize () {
    return (
      <select className="form-control" value={store.model.props.style.fontSize} onChange={this.changeFontSize}>
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
    const { fontColor } = store.model.props.style
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
