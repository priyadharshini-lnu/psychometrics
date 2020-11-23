import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import styles from './SubmitPage.scss'
import Footer from '../Page/components/PageFooter'

export class SubmitPage extends Component {
  static propTypes = {
    flowElement: PropTypes.object,
  }

  addLtrStyleIfNeed (phrase) {
    return phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {}
  }

  renderUniqueId () {
    const { flowElement, dbResult } = this.props
    if (flowElement && flowElement.type === 'EndOfAssessment') {
      if (flowElement.props.showUniqueId) {
        return (
          <div className={styles.end}>
            Your unique ID:
            {_.result(dbResult, 'hash_id', '<it is builder>')}
          </div>
        )
      }
    }
    return null
  }

  render () {
    const {
      page, nextPage, preview, prevPage, hasPrevPage,
      isDisconnected,
    } = this.props

    return (
      <div className={styles.page}>
        <div className={styles.question}>
          <div className={cs(styles.message)}>
            {I18n.t('assessments.page.confirm_message_1')}
          </div>
        </div>

        <Footer
          preview={preview}
          hasPrevPage={hasPrevPage}
          page={page}
          prevPage={prevPage}
          nextPage={nextPage}
          isDisconnected={isDisconnected}
          showSubmit
        />
      </div>
    )
  }
}

export default SubmitPage
