import { Component } from 'react'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'

class Properties extends Component {
  update = () => {
    const { model } = this.props
    model.update()
  }

  changeHeader = () => {
    const { model } = this.props
    model.props.showHeader = !model.props.showHeader
    model.update()
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <div className={styles.title}>Gap Assessment Scoring</div>
        <PropertyFilter model={model} />
        <div style={{ fontStyle: 'italic' }}>2 filters should be selected for comparison</div>
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
