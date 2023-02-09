import { Component } from 'react'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'
import dataSources from './dataSources'

export default class Properties extends Component {
  onChange = (key, value) => {
    const { model } = this.props
    model.props[key] = value
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = this.props
    const DataSource = dataSources[model.props.sourceType]

    return (
      <div>
        <div className={styles.title}>Single Value</div>
        <SourceTypeButtonGroup model={model} onChange={this.onChange} />
        <DataSource model={model} onChange={this.onChange} />
        <div className="mtm">
          <PropertyFilter model={model} />
        </div>
      </div>
    )
  }
}
