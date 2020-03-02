import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'store/AssessmentPreviewStore'
import cs from 'classnames'
import styles from './Page.scss'

class PageFooter extends Component {
  static propTypes = {
    page: PropTypes.object.isRequired,
  }

  prev = () => {
    const { prevPage, preview } = this.props
    prevPage(preview)
  }

  next = () => {
    const { nextPage } = this.props
    nextPage()
    // store.nextPage()
  }

  render () {
    const { page, preview: { enableBack }, hasPrevPage } = this.props
    return (
      <div className={styles.footer}>
        {enableBack && hasPrevPage && (
          <a className={cs('btn btn-default', styles.btn, styles.btnDefault)} onClick={this.prev}>
            {page.prevBtn || 'Back'}
          </a>
        )}
        <a className={cs('btn btn-default', styles.btn, styles.btnPrimary)} onClick={this.next}>
          {page.nextBtn || 'Next'}
        </a>
      </div>
    )
  }
}

export default PageFooter
