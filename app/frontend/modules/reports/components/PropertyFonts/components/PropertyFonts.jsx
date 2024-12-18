import _ from 'lodash'
import cs from 'classnames'
import { rgba2hex } from '~/utils/color'
import { ColorPicker } from '~/glint'
import DefaultProps from '~/modules/reports/consts/DefaultProps'
import styles from './PropertyFonts.less'
import { STYLE_TYPE } from './constants'

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


const PropertyFilter = ({
  modules, colors, reportStyles = {}, styleType = STYLE_TYPE.style,
}) => {
  const model = modules[0]
  const updateAll = (cb) => {
    modules.forEach((module) => {
      cb?.(module)
      module.update()
    })
  }

  const changeFontFamily = (e) => {
    updateAll((model) => {
      model.props[styleType].fontFamily = e.currentTarget.value
    })
  }

  const changeFontSize = (e) => {
    updateAll((model) => {
      model.props[styleType].fontSize = e.currentTarget.value
    })
  }

  const changeFontColor = (color) => {
    updateAll((model) => {
      model.props[styleType].fontColor = color
    })
  }

  const update = () => {
    updateAll()
  }


  const renderFontFamily = () => {
    const textStyles = _.compact((model.props.styleIds || []).map(id => reportStyles[id]))
    const hasStyle = isHasStyle(textStyles, 'fontFamily')
    return (
      <select
        className={cs('form-control', styleClassess(textStyles, 'fontFamily', model.props[styleType].fontFamily))}
        value={model.props[styleType].fontFamily}
        onChange={changeFontFamily}
      >
        <option value="">{hasStyle ? 'Inherited' : 'Default'}</option>
        {_.map(FONTS, (value, key) => (<option key={key} value={value}>{key}</option>))}
      </select>
    )
  }

  const renderFontSize = () => {
    const textStyles = _.compact((model.props.styleIds || []).map(id => reportStyles[id]))

    return (
      <select
        className={cs('form-control', styleClassess(textStyles, 'fontSize', model.props[styleType].fontSize))}
        value={model.props[styleType].fontSize}
        onChange={changeFontSize}
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

  const renderFontColor = () => {
    const { fontColor } = model.props[styleType]
    const notNullfontColor = fontColor || '#000000'
    const fontColorHex = typeof notNullfontColor === 'object'
      ? (rgba2hex(fontColor)) : notNullfontColor
    const textStyles = _.compact((model.props.styleIds || []).map(id => reportStyles[id]))

    return (
      <ColorPicker
        swatchClassName={cs(styles.swatch, styleClassess(textStyles, 'color', notNullfontColor))}
        getValueInHexFormat
        value={fontColorHex}
        onChange={changeFontColor}
        onComplete={update}
      />
    )
  }

  let output = (
    <div>
      {renderFontFamily()}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {renderFontSize()}
        {renderFontColor()}
      </div>
    </div>
  )

  if (colors === false) {
    output = (
      <div>
        {renderFontFamily()}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          {renderFontSize()}
        </div>
      </div>
    )
  }

  return output
}

export default PropertyFilter
