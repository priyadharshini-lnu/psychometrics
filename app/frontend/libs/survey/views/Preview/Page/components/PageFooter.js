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
    store.prevPage()
  }

  next = () => {
    const { nextPage } = this.props
    nextPage()
    // store.nextPage()
  }

  render () {
    const { page } = this.props
    return (
      <div className={styles.footer}>
        {store.assessment.enable_back && store.canBack()
          && (
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
