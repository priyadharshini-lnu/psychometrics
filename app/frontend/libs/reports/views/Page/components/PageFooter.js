import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PageListDispatcher from 'rb/dispatchers/PageListDispatcher'
import styles from './Page.scss'

class PageFooter extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  addPage = () => {
    const { model } = this.props
    PageListDispatcher.addPageAfter(model)
  }

  render () {
    return (
      <div className={styles.footer}>
        <a onClick={this.addPage}>Add Page Here</a>
      </div>
    )
  }
}

export default PageFooter
