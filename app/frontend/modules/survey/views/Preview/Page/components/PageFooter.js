import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import { I18n } from 'modules/survey/store/StoreWatchman'
import { Popconfirm } from 'antd'
import { getQuestion } from 'modules/survey/core/preview/FlowProcessor/selectors'
import styles from './Page.scss'

const BACK = 'BACK'
const NEXT = 'NEXT'

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
      page, preview, preview: { enableBack }, hasPrevPage,
    } = this.props
    const { popConfirmVisibleFor } = this.state

    return (
      <div className={cs(styles.footer)}>
        {enableBack && hasPrevPage && (
          <QuestionInProgressPopConfirm
            preview={preview}
            visible={popConfirmVisibleFor === BACK}
            hidePopConfirm={this.hidePopConfirm}
            onConfirm={this.moveToPreviousPage}
          >
            <button
              type="button"
              className={cs('btn-default', styles.btn, styles.btnDefault)}
              onClick={this.handlePreviousClick}
            >
              <span className="mrs mls fa fa-chevron-left rtl-flip" />
              { page.prevBtn || I18n().t('assessments.page.back') }
            </button>
          </QuestionInProgressPopConfirm>
        )}
        <QuestionInProgressPopConfirm
          preview={preview}
          visible={popConfirmVisibleFor === NEXT}
          hidePopConfirm={this.hidePopConfirm}
          onConfirm={this.moveToNextPage}
        >
          <button
            type="button"
            className={cs('btn-default', styles.btn, styles.btnPrimary)}
            onClick={this.handleNextClick}
          >
            {page.nextBtn || I18n().t('assessments.page.next')}
            <span className="mls mrs fa fa-chevron-right rtl-flip" />
          </button>
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
      <b>{I18n().t('validations.actions_still_in_progress')}</b>
      <ul className="pll">
        {inProgressQuestions.map(({ questionId, progressState }) => {
          const question = getQuestion(preview, questionId)
          return (
            <li key={question.id}>{I18n().t(`validations.${question.type}.in_progress.${progressState}`)}</li>
          )
        })}
      </ul>
    </div>
  )

  return (
    <Popconfirm
      title={popConfirmTitle()}
      onConfirm={onConfirm}
      okText={I18n().t('assessments.proceed')}
      cancelText={I18n().t('assessments.wait')}
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
