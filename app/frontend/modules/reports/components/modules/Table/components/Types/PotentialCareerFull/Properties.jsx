import { Component } from 'react'
import _ from 'lodash'
import Select from 'react-select'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFonts from '~/modules/reports/components/PropertyFonts'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'

const SELECT_OPTIONS = _.times(30, i => ({
  value: i + 1,
  label: `top ${i + 1}`,
}))

class Properties extends Component {
  update = () => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.group = null
      model.update()
    })
  }

  changeTopPosition = (e) => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.topPosition = e ? e.value : null
      model.update()
    })
  }

  render () {
    const { modules } = this.props
    const model = modules[0]
    return (
      <div>
        <span className={styles.label}>Top Position</span>
        <Select
          name="form-field-name"
          value={getValue(SELECT_OPTIONS, model.props.topPosition)}
          options={SELECT_OPTIONS}
          getOptionValue={opt => opt.value}
          onChange={this.changeTopPosition}
        />
        <hr className={styles.divider} />
        <div>Font</div>
        <PropertyFonts modules={modules} colors={false} />
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
