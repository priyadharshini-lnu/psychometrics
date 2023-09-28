import { Component } from 'react'
import store from '~/modules/reports/store/PropertyPanelStore'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import styles from '../../../views/PropertyPanel/components/PropertyPanel.less'

class PropertyPagination extends Component {
  static propTypes = {}

  changeItemsPerPage = (value) => {
    store.model.props.itemsPerPage = value
    this.update()
  }

  changePageNumber = (value) => {
    store.model.props.pageNumber = value
    this.update()
  }

  update = () => {
    store.model.update()
    this.forceUpdate()
  }

  renderItemsPerPage () {
    return (
      <div className={styles.block}>
        Number of items
        <ChoicesInput
          onChange={this.changeItemsPerPage}
          value={store.model.props.itemsPerPage}
          minValue={1}
          maxValue={30}
        />
      </div>
    )
  }

  renderPageNumber () {
    return (
      <div className={styles.block}>
        Page Number
        <ChoicesInput
          onChange={this.changePageNumber}
          value={store.model.props.pageNumber}
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
