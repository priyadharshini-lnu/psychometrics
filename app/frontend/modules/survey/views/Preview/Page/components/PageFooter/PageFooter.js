import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import { Button, Popconfirm } from 'antd'
import { getIn } from 'utils/immutable'
import { isRtl } from 'utils/locales'
import { getQuestion } from 'modules/survey/core/preview/FlowProcessor/selectors'
import styles from './styles.scss'

const BACK = 'BACK'
const NEXT = 'NEXT'
const { I18n } = window

class PageFooter extends Component {
  state = {
    popConfirmVisibleFor: null,
  }

  static propTypes = {
    page: PropTypes.object.isRequired,
  }

  componentDidMount () {
    window.onbeforeunload = () => {
      if (this.areQuestionsInProgress()) { return true }
      return null
    }
  }

  areQuestionsInProgress = () => {
    const { preview: { inProgressQuestions } } = this.props
    return inProgressQuestions.length
  }

  moveToPreviousPage = () => {
    const { prevPage, preview } = this.props
    this.setState({ popConfirmVisibleFor: null })
    document.body.scrollIntoView({ behavior: 'smooth' })
    prevPage(preview)
  }

  handlePreviousClick = () => {
    if (this.areQuestionsInProgress()) {
      this.setState({ popConfirmVisibleFor: BACK })
    } else {
      this.moveToPreviousPage()
    }
  }

  moveToNextPage = () => {
    const { nextPage } = this.props
    this.setState({ popConfirmVisibleFor: null })
    document.body.scrollIntoView({ behavior: 'smooth' })
    nextPage()
  }

  handleNextClick = () => {
    if (this.areQuestionsInProgress()) {
      this.setState({ popConfirmVisibleFor: NEXT })
    } else {
      this.moveToNextPage()
    }
  }

  hidePopConfirm = () => {
    this.setState({ popConfirmVisibleFor: null })
  }

  render () {
    const {
      page, preview, preview: { enableBack }, hasPrevPage, isDisconnected, showSubmit,
    } = this.props
    const { popConfirmVisibleFor } = this.state
    const rtl = isRtl(I18n.uiLocale)

    return (
      <div className={cs(styles.footer, rtl ? 'rtl' : 'ltr')}>
        {enableBack && hasPrevPage && (
          <QuestionInProgressPopConfirm
            preview={preview}
            visible={popConfirmVisibleFor === BACK}
            hidePopConfirm={this.hidePopConfirm}
            onConfirm={this.moveToPreviousPage}
          >
            <Button
              size="large"
              type="default"
              disabled={isDisconnected}
              onClick={this.handlePreviousClick}
              className="mrs"
            >
              <span className="mrs mls fa fa-chevron-left rtl-flip" />
              { page.prevBtn || I18n.t('assessments.page.back', { locale: I18n.uiLocale }) }
            </Button>
          </QuestionInProgressPopConfirm>
        )}
        <QuestionInProgressPopConfirm
          preview={preview}
          visible={popConfirmVisibleFor === NEXT}
          hidePopConfirm={this.hidePopConfirm}
          onConfirm={this.moveToNextPage}
        >
          {showSubmit ? (
            <Button size="large" type="primary" disabled={isDisconnected} onClick={this.handleNextClick}>
              {I18n.t('assessments.page.submit', { locale: I18n.uiLocale })}
            </Button>
          ) : (
            <Button
              size="large"
              type="primary"
              disabled={isDisconnected}
              onClick={this.handleNextClick}
              className={styles.next}
            >
              {page.nextBtn || I18n.t('assessments.page.next', { locale: I18n.uiLocale })}
              <span className="mls mrs fa fa-chevron-right rtl-flip" />
            </Button>
          )}
        </QuestionInProgressPopConfirm>
      </div>
    )
  }
}

function QuestionInProgressPopConfirm ({
  preview, preview: { inProgressQuestions }, visible, hidePopConfirm, onConfirm, children,
}) {
  const popConfirmTitle = () => (
    <div>
      <b>{I18n.t('validations.actions_still_in_progress', { locale: I18n.uiLocale })}</b>
      <ul className="pll">
        {inProgressQuestions.map(({ questionId, progressState }) => {
          const question = getQuestion(preview, questionId)
          return (
            <li key={question.id}>
              {I18n.t(`validations.${question.type}.in_progress.${progressState}`, { locale: I18n.uiLocale })}
            </li>
          )
        })}
      </ul>
    </div>
  )

  return (
    <Popconfirm
      title={popConfirmTitle()}
      onConfirm={onConfirm}
      okText={I18n.t('assessments.proceed', { locale: I18n.uiLocale })}
      cancelText={I18n.t('assessments.wait', { locale: I18n.uiLocale })}
      onCancel={hidePopConfirm}
      visible={visible && inProgressQuestions.length > 0}
      disabled={!inProgressQuestions.length}
      placement="topRight"
    >
      {children}
    </Popconfirm>
  )
}

export default PageFooter
