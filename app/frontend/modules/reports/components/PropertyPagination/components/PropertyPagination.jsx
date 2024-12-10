import { Component } from 'react'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import styles from '../../../views/PropertyPanel/components/PropertyPanel.less'

class PropertyPagination extends Component {
  static propTypes = {}

  changeItemsPerPage = (value) => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.itemsPerPage = value
      model.update()
    })
    this.forceUpdate()
  }

  changePageNumber = (value) => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.pageNumber = value
      model.update()
    })
    this.forceUpdate()
  }

  update = () => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.update()
    })
    this.forceUpdate()
  }

  renderItemsPerPage () {
    const { modules } = this.props
    const model = modules[0]

    return (
      <div className={styles.block}>
        Number of items
        <ChoicesInput
          onChange={this.changeItemsPerPage}
          value={model.props.itemsPerPage}
          minValue={1}
          maxValue={30}
        />
      </div>
    )
  }

  renderPageNumber () {
    const { modules } = this.props
    const model = modules[0]
    return (
      <div className={styles.block}>
        Page Number
        <ChoicesInput
          onChange={this.changePageNumber}
          value={model.props.pageNumber}
          minValue={1}
          maxValue={30}
        />
      </div>
    )
  }

  render () {
    return (
      <div>
        {this.renderItemsPerPage()}
        {this.renderPageNumber()}
      </div>
    )
  }
}

export default PropertyPagination
