import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'

const Properties = ({ modules }) => {
  const model = modules[0]
  const { factorsWidth, innerCircleRadius, innerCircleText } = model.props

  const updateAll = (cb) => {
    modules.forEach((module) => {
      cb(module)
      module.update()
    })
  }

  const changeFactorsWidth = (value) => {
    updateAll((item) => {
      item.props.factorsWidth = value
    })
  }

  const changeInnerCircleRadius = (value) => {
    updateAll((item) => {
      item.props.innerCircleRadius = value
    })
  }

  const changeInnerCircleText = (event) => {
    updateAll((item) => {
      item.props.innerCircleText = event.currentTarget.value
    })
  }

  return (
    <div className={styles.block}>
      Factors Width
      <ChoicesInput minValue={25} maxValue={50} value={factorsWidth} onChange={changeFactorsWidth} />
      <div className={styles.block}>
        Inner Radius
        <ChoicesInput minValue={5} maxValue={200} value={innerCircleRadius} onChange={changeInnerCircleRadius} />
      </div>
      <div className={styles.block}>
        Inner Text
        <input className="form-control" value={innerCircleText} onChange={changeInnerCircleText} />
      </div>
    </div>
  )
}

export default Properties
