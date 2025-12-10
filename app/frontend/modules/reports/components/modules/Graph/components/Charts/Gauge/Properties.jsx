import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { ColorPicker, HintCheckbox } from '~/glint'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'

const Properties = ({ modules }) => {
  const model = modules[0]
  const {
    speedometerBackgroundColor, speedometerMainColor, labelVerticalPosition, speedometerSize, maxValue, gaugeWidth,
    gaugeBorder, borderColor, valueVerticalPosition,
  } = model.props

  const updateAll = (cb) => {
    modules.forEach((module) => {
      cb(module)
      module.update()
    })
  }

  const changeSize = (val) => {
    updateAll((item) => {
      item.props.speedometerSize = `${val}%`
    })
  }

  const handleValueControl = (type, val) => {
    updateAll((item) => {
      item.props[type] = val
    })
  }

  const changeMaxValue = (val) => {
    updateAll((item) => {
      item.props.maxValue = val
    })
  }

  const changeWidthValue = (val) => {
    updateAll((item) => {
      item.props.gaugeWidth = val
    })
  }

  const changeBorderValue = (val) => {
    updateAll((item) => {
      item.props.gaugeBorder = val
    })
  }

  const changeColorProperty = (propertyName, color) => {
    updateAll((item) => {
      item.props[propertyName] = color
    })
  }

  const handleCheckControl = (type) => {
    updateAll((item) => {
      item.props[type] = !model.props[type]
    })
  }

  return (
    <div>
      <div className={styles.block}>
        Main Color
        <ColorPicker
          value={speedometerMainColor}
          getValueInHexFormat
          onChange={color => changeColorProperty('speedometerMainColor', color)}
        />
      </div>
      <div className={styles.block}>
        Background Color
        <ColorPicker
          getValueInHexFormat
          value={speedometerBackgroundColor}
          onChange={color => changeColorProperty('speedometerBackgroundColor', color)}
        />
      </div>
      <div className={styles.block}>
        Border Color
        <ColorPicker
          getValueInHexFormat
          value={borderColor}
          onChange={color => changeColorProperty('borderColor', color)}
        />
      </div>
      <hr className={styles.divider} />

      <div className="margin-top-10">
        <HintCheckbox
          label="Hide Label"
          checked={model.props.hideLabel}
          onChange={() => handleCheckControl('hideLabel')}
          hints={['It will hide label on the top of chart', 'It will show label on the top of chart']}
        />
      </div>
      <div className="margin-top-10">
        <HintCheckbox
          label="Hide Markers"
          checked={model.props.hideMarkers}
          onChange={() => handleCheckControl('hideMarkers')}
          hints={['It will hide markers from the chart', 'It will show markers on the chart']}
        />
      </div>
      <div className="margin-top-10">
        <HintCheckbox
          label="Percentage"
          checked={model.props.gaugePercentage}
          onChange={() => handleCheckControl('gaugePercentage')}
          hints={['It will show value as score', ' It will show value as percentage score']}
        />
      </div>
      <div className="margin-top-10">
        <HintCheckbox
          label="Rounded"
          checked={model.props.rounded}
          onChange={() => handleCheckControl('rounded')}
          hints={[' It will show rounded corners', 'It will show normal corners']}
        />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Label Vertical Position
        <ChoicesInput
          value={labelVerticalPosition}
          onChange={val => handleValueControl('labelVerticalPosition', val)}
          minValue={-200}
          maxValue={200}
        />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Value Vertical Position
        <ChoicesInput
          value={valueVerticalPosition}
          onChange={val => handleValueControl('valueVerticalPosition', val)}
          minValue={-200}
          maxValue={200}
        />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Speedometer Size
        <ChoicesInput value={parseInt(speedometerSize, 10)} onChange={changeSize} minValue={40} maxValue={200} />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Max Value
        <ChoicesInput
          value={parseInt(maxValue, 10) || 6}
          onChange={changeMaxValue}
          minValue={0}
          maxValue={1000}
        />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Width
        <ChoicesInput
          value={gaugeWidth}
          onChange={changeWidthValue}
          minValue={0}
          maxValue={100}
        />
      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Border
        <ChoicesInput
          value={gaugeBorder}
          onChange={changeBorderValue}
          minValue={0}
          maxValue={1000}
        />
      </div>
      <hr className={styles.divider} />
    </div>
  )
}

export default Properties
