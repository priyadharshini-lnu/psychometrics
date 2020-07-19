import React, { Component } from 'react'
import store from 'rb/store/PropertyPanelStore'
import ChoicesInput from 'rb/components/ChoicesInput'
import styles from '../../../views/PropertyPanel/components/PropertyPanel.scss'

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
