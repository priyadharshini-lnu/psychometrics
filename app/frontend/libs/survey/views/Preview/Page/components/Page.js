import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import QuestionList from 'views/Preview/QuestionList'
import store from 'store/AssessmentPreviewStore'
import I18nStore from 'store/I18nStore'
import ScrollDispatcher from 'dispatchers/ScrollDispatcher'
import cs from 'classnames'
import Footer from './PageFooter'
import styles from './Page.scss'

class Page extends Component {
  static propTypes = {
    page: PropTypes.object.isRequired,
  }

  addLtrStyleIfNeed = phrase => (phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {})

  scroll = (hash) => {
    ScrollDispatcher.scroll(hash)
  }

  renderErrors (page) {
    const styleForTitle = this.addLtrStyleIfNeed(I18nStore.t('validations.title'))
    const styleForIssue = this.addLtrStyleIfNeed(I18nStore.t('validations.issue'))
    return (
      <div className={styles.errors}>
        <h1 style={styleForTitle}>{I18nStore.t('validations.title')}</h1>
        <ul style={styleForTitle}>
          {page.errors.map(({ question, errors }, i) => (
            <li key={i} style={styleForIssue}>
              <a onClick={this.scroll.bind(this, `question_${question.id}`)}>
                {I18nStore.t('validations.issue')}
                {' '}
                {i + 1}
              </a>
              <ul>
                {_.map(errors, (error, j) => (
                  <li style={this.addLtrStyleIfNeed(error.message)} key={j}>{error.message}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderProgressBar () {
    const progress = store.flow.getProgress()
    if (progress || progress === 0) {
      return (
        <div className={cs('progress', styles.progress)}>
          <div
            className={cs('progress-bar', styles.progressBar)}
            style={{ width: `${_.round(progress)}%`, minWidth: '2em' }}
          >
            <span>{`${_.round(progress)}%`}</span>
          </div>
        </div>
      )
    }
    return null
  }

  render () {
    const { page } = this.props
    return (
      <div className={`${styles.block} fe-ass-page-container-${store.type}`}>
        <div className={styles.logo}>
          {/* <img src={Logo} /> */}
        </div>

        {store.readOnly && <div className={styles.readOnly}>Is read only mode, you can not change any results.</div>}
        {store.type !== 'preview_block' && store.assessment.enable_progress && this.renderProgressBar()}
        {!store.ignoreValidation && page.errors.length > 0 && this.renderErrors(page)}
        <QuestionList page={page} />
        {store.type !== 'preview_block' && <Footer page={page} />}
      </div>
    )
  }
}

export default Page
