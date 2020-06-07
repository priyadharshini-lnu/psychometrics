import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import QuestionList from 'views/Preview/QuestionList'
import Utils from 'utils/Utils'
import cs from 'classnames'
import StaticContent from 'views/Preview/StaticContent'
import { LEFT, RIGHT } from 'views/Block/components/StaticContent/settings'
import Footer from './PageFooter'
import styles from './Page.scss'

class Page extends Component {
  static propTypes = {
    page: PropTypes.object.isRequired,
  }

  getBlockClasses () {
    const { block: { props: { staticContent } } } = this.props

    if (!staticContent) return
    const { layout } = staticContent
    return cs({ [styles.blockWithSideStaticContent]: (layout === LEFT || layout === RIGHT) })
  }

  getQuestionContainerClasses () {
    const { block: { props: { staticContent } } } = this.props

    if (!staticContent) return
    const { layout } = staticContent
    return cs({
      [styles.sideStaticContent]: (layout === LEFT || layout === RIGHT),
      [styles.rightStaticContent]: (layout === RIGHT),
    })
  }

  addLtrStyleIfNeed = phrase => (phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {})

  scroll = (hash) => {
    Utils.scroll(hash)
  }

  renderErrors () {
    const { errors, I18n } = this.props
    const styleForTitle = this.addLtrStyleIfNeed(I18n.t('validations.title'))
    const styleForIssue = this.addLtrStyleIfNeed(I18n.t('validations.issue'))
    let i = 0
    return (
      <div className={styles.errors}>
        <h1 style={styleForTitle}>{I18n.t('validations.title')}</h1>
        <ul style={styleForTitle}>
          {_.map(errors, (errors, id) => {
            i += 1
            return (
              <li key={id} style={styleForIssue}>
                <a onClick={this.scroll.bind(this, `question_${id}`)}>
                  {I18n.t('validations.issue')}
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

  render () {
    const {
      page, questions, errors, nextPage, preview, prevPage, hasPrevPage,
      block: { props: { staticContent } },
      preview: {
        ignoreValidation, readOnly, type,
      },
    } = this.props

    if (!page) { return }
    return (
      <div className={cs(this.getBlockClasses(), styles.block, `fe-ass-page-container-${type}`)}>
        {readOnly && <div className={styles.readOnly}>Is read only mode, you can not change any results.</div>}
        <div className={this.getQuestionContainerClasses()}>
          {staticContent && <StaticContent />}
          <div className={cs(styles.questionsBlock, { staticBlockQuestionList: staticContent })}>
            {!ignoreValidation && errors && this.renderErrors(page)}
            <QuestionList readOnly={readOnly} page={page} questions={questions} />
          </div>
        </div>
        {type !== 'preview_block' && (
          <Footer preview={preview} hasPrevPage={hasPrevPage} page={page} prevPage={prevPage} nextPage={nextPage} />
        )}
      </div>
    )
  }
}

export default Page
