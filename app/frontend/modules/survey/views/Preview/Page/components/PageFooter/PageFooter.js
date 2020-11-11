import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import { I18n } from 'modules/survey/store/StoreWatchman'
import { Button, Popconfirm } from 'antd'
import { getIn } from 'utils/immutable'
import { getQuestion } from 'modules/survey/core/preview/FlowProcessor/selectors'
import styles from './styles.scss'

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
      page, preview, preview: { enableBack }, hasPrevPage, isDisconnected, options, isLast,
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
            <Button
              size="large"
              type="default"
              disabled={isDisconnected}
              onClick={this.handlePreviousClick}
              className="mrs"
            >
              <span className="mrs mls fa fa-chevron-left rtl-flip" />
              { page.prevBtn || I18n().t('assessments.page.back') }
            </Button>
          </QuestionInProgressPopConfirm>
        )}
        <QuestionInProgressPopConfirm
          preview={preview}
          visible={popConfirmVisibleFor === NEXT}
          hidePopConfirm={this.hidePopConfirm}
          onConfirm={this.moveToNextPage}
        >
          {isLast ? (
            <Popconfirm
              title={<PopconfirmTitle options={options} />}
              onConfirm={this.handleNextClick}
              okText={I18n().t('common.text.ok')}
              cancelText={I18n().t('common.text.cancel')}
              disabled={isDisconnected}
            >
              <Button size="large" type="primary" disabled={isDisconnected}>
                {I18n().t('assessments.page.submit')}
              </Button>
            </Popconfirm>
          ) : (
            <Button
              size="large"
              type="primary"
              disabled={isDisconnected}
              onClick={this.handleNextClick}
              className={styles.next}
            >
              {page.nextBtn || I18n().t('assessments.page.next')}
              <span className="mls mrs fa fa-chevron-right rtl-flip" />
            </Button>
          )}
        </QuestionInProgressPopConfirm>
      </div>
    )
  }
}

function PopconfirmTitle ({ options }) {
  if (getIn(options, ['global', 'canNotEditEvaluation'])) {
    return (
      <div className={styles.popconfirm}>
        <div>{I18n().t('frontend.are_you_sure')}</div>
        <div>{I18n().t('assessments.page.confirm_message_1')}</div>
      </div>
    )
  }


  return (
    <div className={styles.popconfirm}>
      <div>{I18n().t('assessments.page.confirm_message_2')}</div>
    </div>
  )
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
