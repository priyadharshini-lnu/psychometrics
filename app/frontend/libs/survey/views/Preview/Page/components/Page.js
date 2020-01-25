import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import QuestionList from 'views/Preview/QuestionList'
import store from 'store/AssessmentPreviewStore'
import I18nStore from 'store/I18nStore'
import Utils from 'utils/Utils'
import cs from 'classnames'
import Footer from './PageFooter'
import styles from './Page.scss'

class Page extends Component {
  static propTypes = {
    page: PropTypes.object.isRequired,
  }

  addLtrStyleIfNeed = phrase => (phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {})

  scroll = (hash) => {
    Utils.scroll(hash)
  }

  renderErrors () {
    const { errors } = this.props
    const styleForTitle = this.addLtrStyleIfNeed(I18nStore.t('validations.title'))
    const styleForIssue = this.addLtrStyleIfNeed(I18nStore.t('validations.issue'))
    let i = 0
    return (
      <div className={styles.errors}>
        <h1 style={styleForTitle}>{I18nStore.t('validations.title')}</h1>
        <ul style={styleForTitle}>
          {_.map(errors, (errors, id) => {
            i += 1
            return (
              <li key={id} style={styleForIssue}>
                <a onClick={this.scroll.bind(this, `question_${id}`)}>
                  {I18nStore.t('validations.issue')}
                  {' '}
                  {i}
                </a>
                <ul>
                  {_.map(errors, (error, j) => (
                    <li style={this.addLtrStyleIfNeed(error.message)} key={j}>{error.message}</li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  renderProgressBar () {
    const progress = store.flow.getProgress()
    if (progress || progress === 0) {
      return (
        <div className={styles.progressBarContainer}>
          <div className={cs('progress', styles.progress)}>
            <div
              className={cs('progress-bar', styles.progressBar)}
              style={{ width: `${_.round(progress)}%`, minWidth: '2em' }}
            />

          </div>
          <div className={styles.progressPercentage}>{`${_.round(progress)}%`}</div>
        </div>
      )
    }
    return null
  }

  render () {
    const {
      page, questions, errors, nextPage,
    } = this.props
    if (!page) { return }
    return (
      <div className={`${styles.block} fe-ass-page-container-${store.type}`}>
        <div className={styles.logo}>
          {/* <img src={Logo} /> */}
        </div>

        {store.readOnly && <div className={styles.readOnly}>Is read only mode, you can not change any results.</div>}
        {store.type !== 'preview_block' && store.assessment.enable_progress && this.renderProgressBar()}
        {!store.ignoreValidation && errors && this.renderErrors(page)}
        <QuestionList page={page} questions={questions} />
        {store.type !== 'preview_block' && <Footer page={page} nextPage={nextPage} />}
      </div>
    )
  }
}

export default Page
