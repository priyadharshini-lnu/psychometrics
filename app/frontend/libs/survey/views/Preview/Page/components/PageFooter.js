import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import Watchman from 'libs/survey/store/StoreWatchman'
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
  }

  render () {
    const { page, preview: { enableBack }, hasPrevPage } = this.props
    return (
      <div className={cs(styles.footer)}>
        {enableBack && hasPrevPage && (
          <button type="button" className={cs('btn-default', styles.btn, styles.btnDefault)} onClick={this.prev}>
            <span className="mrs mls fa fa-chevron-left rtl-flip" />
            { page.prevBtn || Watchman.I18n().t('assessments.page.back') }
          </button>
        )}
        <button type="button" className={cs('btn-default', styles.btn, styles.btnPrimary)} onClick={this.next}>
          { page.nextBtn || Watchman.I18n().t('assessments.page.next') }
          <span className="mls mrs fa fa-chevron-right rtl-flip" />
        </button>
      </div>
    )
  }
}

export default PageFooter
