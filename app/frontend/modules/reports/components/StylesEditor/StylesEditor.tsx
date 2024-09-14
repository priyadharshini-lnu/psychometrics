import { useState } from 'react'
import {
  Space, Button, Select,
  InputNumber,
  Checkbox, Radio,
  Slider,
} from 'antd'
import {
  CopyOutlined, SnippetsOutlined, DeleteOutlined,
} from '@ant-design/icons'
import _ from 'lodash'
import styles from './StylesEditor.less'
import LabelEditor from '../LabelEditor'
import { ColorPicker } from '~/glint'
import { gradientStyle, stylesPreview } from '../modules/CommonMethods/styles'

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

export const FONT_WEIGHTS = {
  100: '100 - Thin',
  200: '200 - Extra Light (Ultra Light)',
  300: '300 - Light',
  400: '400 - Normal',
  500: '500 - Medium',
  600: '600 - Semi Bold (Demi Bold)',
  700: '700 - Bold',
  800: '800 - Extra Bold (Ultra Bold)',
  900: '900 - Black (Heavy)',
}

export const TEXT_DECORATIONS = {
  underline: 'Underline',
  'line-through': 'Line Through',
  overline: 'Overline',
  'underline overline': 'Underline Overline',
}

const DEFAULT_GRADIENT = {
  enabled: true,
  type: 'linear',
  degree: 90,
  points: [{ color: '#000000', position: 0 }, { color: '#ffffff', position: 100 }],
}


export const StylesEditor = ({ style, onSave, onCancel }) => {
  const [data, setData] = useState(style)
  const [, fontSize, size] = (data.styles.fontSize || '').match(/(\d+)([\w%]+)/) || []

  const [points, setPoints] = useState(size || 'px')

  const changeName = (name) => {
    setData({ ...data, name })
  }

  const changeStyle = (styleName, value) => {
    if ((value === false || value === 0) ? true : value) {
      setData({ ...data, styles: { ...data.styles, [styleName]: value } })
    } else {
      removeStyle(styleName)
    }
  }

  const removeStyle = (styleName) => {
    setData({ ...data, styles: { ..._.omit(data.styles, styleName) } })
  }

  const changeBoxShadow = (updates) => {
    const styles = { ...data.styles, boxShadow: { ...(data.styles.boxShadow || {}), ...updates } }

    setData({ ...data, styles })
  }

  const changeGradient = (updates) => {
    if (!data.styles.gradient) {
      return setData({ ...data, styles: { ...data.styles, gradient: { ...DEFAULT_GRADIENT } } })
    }

    const styles = { ...data.styles, gradient: { ...(data.styles.gradient || {}), ...updates } }
    setData({ ...data, styles })
  }

  const changeFontSize = (value) => {
    setData({ ...data, styles: { ...data.styles, fontSize: `${value}${points}` } })
  }

  const changePoints = (value) => {
    setPoints(value)
    setData({ ...data, styles: { ...data.styles, fontSize: `${fontSize}${value}` } })
  }

  const get = styleName => data.styles[styleName]

  const copy = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(JSON.stringify(data.styles))
  }

  const paste = (e) => {
    e.preventDefault()

    navigator.clipboard.readText().then((text) => {
      try {
        const styles = JSON.parse(text)
        validateStyles(styles)
        setData({ ...data, styles })
      } catch (e) { /* empty */ }
    })
  }

  return (
    <div className={styles.editor}>
      <div className={styles.nameField}>
        <div className={styles.label}>Style name:</div>
        <LabelEditor
          styles={styles.name}
          value={data.name || 'New Style'}
          onChange={val => changeName(val)}
          minWidth="100%"
          maxWidth="100%"
        />
      </div>
      <hr className={styles.divider} />
      <div
        className={styles.preview}
        style={stylesPreview(data.styles)}
      >
        <div className="w-100">
          Sample Text
        </div>
      </div>
      <hr className={styles.divider} />
      <Select
        value={get('fontFamily')}
        onChange={val => changeStyle('fontFamily', val)}
        placeholder="Font Family"
        className="w-100"
        size="small"
        allowClear
      >
        {_.map(FONTS, (value, key) => <Select.Option value={value} key={key}>{key}</Select.Option>)}
      </Select>
      <Select
        value={get('fontStyle')}
        onChange={val => changeStyle('fontStyle', val)}
        placeholder="Font Style"
        className="w-100"
        size="small"
        allowClear
      >
        <Select.Option value="italic">Italic</Select.Option>
        <Select.Option value="oblique">oblique</Select.Option>
      </Select>
      <Select
        value={get('fontWeight')}
        onChange={val => changeStyle('fontWeight', val)}
        placeholder="Font Weight"
        className="w-100"
        size="small"
        allowClear
      >
        {_.map(FONT_WEIGHTS, (value, key) => <Select.Option value={key} key={key}>{value}</Select.Option>)}
      </Select>
      <Select
        value={get('textDecoration')}
        onChange={val => changeStyle('textDecoration', val)}
        placeholder="Text Decoration"
        className="w-100"
        size="small"
        allowClear
      >
        {_.map(TEXT_DECORATIONS, (value, key) => <Select.Option value={key} key={key}>{value}</Select.Option>)}
      </Select>
      <Space direction="vertical" style={{ marginTop: 5 }}>
        <div className={styles.flexLabel}>
          <ColorPicker
            swatchClassName={styles.swatch}
            getValueInHexFormat
            value={get('color')}
            onChange={val => changeStyle('color', val)}
            onClear={() => removeStyle('color')}
          />
          <span>Font Color</span>
        </div>
        <Space direction="vertical">
          <span>Font Size</span>
          <div className={styles.fontSize}>
            <InputNumber
              value={fontSize}
              onChange={changeFontSize}
              size="small"
              className={styles.input}
              min={1}
              max={500}
            />
            <Select value={points} onChange={changePoints} size="small" className={styles.select}>
              <Select.Option value="px">px</Select.Option>
              <Select.Option value="em">em</Select.Option>
              <Select.Option value="%">%</Select.Option>
            </Select>
          </div>
        </Space>
      </Space>
      <hr className={styles.divider} />

      <div className={styles.containersBox}>
        <div className={styles.horizontalContainer}>
          {_.map(['left', 'center', 'right', 'justify'], (type, i) => (
            <div
              key={i}
              onClick={() => changeStyle('textAlign', type)}
              className={`
                ${get('textAlign') === type && styles.active} ${styles.alignedBlock} ${styles[type]}
              `}
            />
          ))}
        </div>
        <div className={styles.verticalContainer}>
          {_.map(['flex-start', 'center', 'flex-end'], (type, i) => (
            <div
              key={i}
              onClick={() => changeStyle('alignItems', type)}
              className={
                `${get('alignItems') === type && styles.active} ${styles.alignedBlock} ${styles[type]}`
              }
            />
          ))}
        </div>
      </div>
      <hr className={styles.divider} />
      <div>
        <Checkbox
          style={{ marginRight: '5px' }}
          type="checkbox"
          checked={get('border')}
          onChange={e => changeStyle('border', e.target.checked)}
        />
        Border
      </div>
      {get('border') && (
        <Space direction="vertical">
          <Space.Compact block>
            <div className={styles.inline}>
              <label>Width</label>
              <InputNumber
                size="small"
                value={get('borderWidth') || 0}
                min={0}
                max={100}
                onChange={val => changeStyle('borderWidth', val)}
              />
            </div>
            <div className={styles.inline}>
              <label>Style</label>
              <Select
                size="small"
                className={styles.borderStyleSelect}
                onChange={val => changeStyle('borderStyle', val)}
                value={get('borderStyle')}
                options={[
                  { value: 'solid' },
                  { value: 'dashed' },
                  { value: 'dotted' },
                  { value: 'double' },
                  { value: 'groove' },
                  { value: 'ridge' },
                  { value: 'inset' },
                  { value: 'outset' },
                ]}
              />
            </div>
          </Space.Compact>
          <div className={styles.flexLabel}>
            <ColorPicker
              swatchClassName={styles.swatch}
              getValueInHexFormat
              value={get('borderColor')}
              onChange={val => changeStyle('borderColor', val)}
              onClear={() => removeStyle('borderColor')}
            />
            <span>Border Color</span>
          </div>
        </Space>
      )}
      <Space direction="vertical">
        Border Radius
        <Space>
          <InputNumber
            value={get('borderRadius')}
            onChange={val => changeStyle('borderRadius', val)}
            size="small"
            min={0}
            max={1000}
            className="w-100"
          />
          px
        </Space>
      </Space>
      <hr className={styles.divider} />
      <Space direction="vertical" className="w-100">
        Background

        <div className={styles.flexLabel}>
          <ColorPicker
            swatchClassName={styles.swatch}
            getValueInHexFormat
            value={get('backgroundColor')}
            onChange={val => changeStyle('backgroundColor', val)}
            onClear={() => removeStyle('backgroundColor')}
          />
          <span>Background Color</span>
        </div>

        <Space>
          <Checkbox
            style={{ marginRight: '5px' }}
            type="checkbox"
            checked={get('gradient')?.enabled}
            onChange={e => changeGradient({ enabled: e.target.checked })}
          />
          Gradient
        </Space>

        {get('gradient')?.enabled && (
          <>
            <div className={styles.gradientPreview} style={{ background: gradientStyle(get('gradient')) }} />
            <Radio.Group
              size="small"
              options={[{ label: 'Linear', value: 'linear' }, { label: 'Radial', value: 'radial' }]}
              onChange={({ target: { value } }) => changeGradient({ type: value })}
              value={get('gradient')?.type || 'linear'}
              optionType="button"
            />
              {get('gradient').type === 'linear' && (
              <Space direction="vertical">
                Gradient Degree
                <Slider
                  value={get('gradient').degree}
                  min={0}
                  max={360}
                  defaultValue={0}
                  onChange={val => changeGradient({ degree: val })}
                />
              </Space>
              )}
              {get('gradient').points.map((point, index) => (
                <div key={index}>
                  <div className={styles.point}>
                    <ColorPicker
                      swatchClassName={styles.swatch}
                      getValueInHexFormat
                      value={point.color}
                      onChange={val => changeGradient({
                        points: _.map(get('gradient').points, (p, i) => (i === index ? { ...p, color: val } : p)),
                      })}
                    />
                    <Slider
                      className="w-100"
                      value={point.position}
                      min={0}
                      max={100}
                      onChange={val => changeGradient({
                        points: _.map(get('gradient').points, (p, i) => (i === index ? { ...p, position: val } : p)),
                      })}
                    />
                    <Button
                      onClick={() => changeGradient({
                        points: _.filter(get('gradient').points, (p, i) => i !== index),
                      })}
                      disabled={index < 2}
                      type="link"
                      className="ms-5"
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </div>
                </div>
              ))}
            <Button
              size="small"
              onClick={() => {
                changeGradient({
                  points: [...get('gradient').points, { color: '#000000', position: 100 }],
                })
              }}
            >
              Add Point
            </Button>
          </>
        )}
      </Space>
      <hr className={styles.divider} />
      <div>
        <Checkbox
          style={{ marginRight: '5px' }}
          type="checkbox"
          checked={get('boxShadow')?.enabled}
          onChange={e => changeBoxShadow({ enabled: e.target.checked })}
        />
        Box Shadow
      </div>
      {get('boxShadow')?.enabled && (
        <Space direction="vertical">
          <Space.Compact block>
            <div className={styles.inline}>
              <label>X</label>
              <InputNumber
                className={styles.smallInput}
                size="small"
                value={get('boxShadow')?.x || 0}
                min={0}
                max={100}
                onChange={val => changeBoxShadow({ x: val })}
              />
            </div>
            <div className={styles.inline}>
              <label>y</label>
              <InputNumber
                className={styles.smallInput}
                size="small"
                value={get('boxShadow')?.y || 0}
                min={0}
                max={100}
                onChange={val => changeBoxShadow({ y: val })}
              />
            </div>
            <div className={styles.inline}>
              <label>Blur</label>
              <InputNumber
                className={styles.smallInput}
                size="small"
                value={get('boxShadow')?.blur || 0}
                min={0}
                max={100}
                onChange={val => changeBoxShadow({ blur: val })}
              />
            </div>
            <div className={styles.inline}>
              <label>Spread</label>
              <InputNumber
                className={styles.smallInput}
                size="small"
                value={get('boxShadow')?.spread || 0}
                min={0}
                max={100}
                onChange={val => changeBoxShadow({ spread: val })}
              />
            </div>
          </Space.Compact>
          <div className={styles.flexLabel}>
            <ColorPicker
              swatchClassName={styles.swatch}
              getValueInHexFormat
              value={get('boxShadow')?.color}
              onChange={val => changeBoxShadow({ color: val })}
            />
            <span>Shadow Color</span>
          </div>
        </Space>
      )}
      <hr className={styles.divider} />
      <Space>
        <Button type="link" icon={<CopyOutlined />} onClick={copy}>Copy</Button>
        <Button type="link" icon={<SnippetsOutlined />} onClick={paste}>Paste</Button>
      </Space>
      <hr className={styles.divider} />
      <Space>
        <Button type="primary" onClick={() => onSave(data)}>Update</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </div>
  )
}

const VALID_FIELDS = [
  'fontFamily', 'fontStyle', 'fontWeight', 'textDecoration', 'color', 'fontSize', 'textAlign', 'alignItems',
]

const validateStyles = (data) => {
  if (!data) { return false }
  const keys = _.keys(data)
  return _.every(keys, key => _.includes(VALID_FIELDS, key))
}

export default StylesEditor
