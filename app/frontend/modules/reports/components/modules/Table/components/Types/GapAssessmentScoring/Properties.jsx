import { Component } from 'react'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'

class Properties extends Component {
  update = () => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.update()
    })
  }

  changeHeader = () => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.showHeader = !model.props.showHeader
      model.update()
    })
  }

  render () {
    const { modules } = this.props
    return (
      <div>
        <div className={styles.title}>Gap Assessment Scoring</div>
        <PropertyFilter modules={modules} />
        <div style={{ fontStyle: 'italic' }}>2 filters should be selected for comparison</div>
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
