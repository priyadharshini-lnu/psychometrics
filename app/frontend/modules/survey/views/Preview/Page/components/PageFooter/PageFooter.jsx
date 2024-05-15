import { Component } from 'react'
import cs from 'classnames'
import {
  Popconfirm, Alert, message,
} from 'antd'
import { FixedWidthButton } from '~/glint'
import { isRtl } from '~/utils/locales'
import { getQuestion } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import styles from './styles.less'

const BACK = 'BACK'
const NEXT = 'NEXT'
const SUBMIT = 'SUBMIT'
const { I18n } = window

class PageFooter extends Component {
  state = {
    popConfirmVisibleFor: null,
    backButtonPressed: false,
    nextButtonPressed: false,
    submitButtonPressed: false,
    saveButtonPressed: false,
  }

  areQuestionsInProgress = () => {
    const { preview: { inProgressQuestions } } = this.props
    return inProgressQuestions.length
  }

  moveToPreviousPage = () => {
    const { prevPage, preview } = this.props
    this.setState({
      popConfirmVisibleFor: null, nextButtonPressed: false, backButtonPressed: true, saveButtonPressed: false,
    })
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

  moveToNextPage = (buttonType) => {
    const { nextPage } = this.props
    const nextButtonPressed = buttonType === NEXT
    this.setState({
      popConfirmVisibleFor: null,
      nextButtonPressed,
      backButtonPressed: false,
      submitButtonPressed: buttonType === SUBMIT,
      saveButtonPressed: false,
    })
    document.body.scrollIntoView({ behavior: 'smooth' })
    nextPage()
  }

  handleNextClick = (buttonType) => {
    if (this.areQuestionsInProgress()) {
      this.setState({ popConfirmVisibleFor: NEXT })
    } else {
      this.moveToNextPage(buttonType)
    }
  }

  saveResults = () => {
    const { saveCurrentPage } = this.props
    this.setState(prevState => ({
      ...prevState, nextButtonPressed: false, backButtonPressed: false, saveButtonPressed: true,
    }))
    saveCurrentPage().then(() => {
      message.success(I18n.t('administration.assessor.saved_results'))
    })
  }

  hidePopConfirm = () => {
    this.setState({ popConfirmVisibleFor: null })
  }

  render () {
    const {
      page, preview,
      preview: {
        enableBack, submissionInProgress, submissionFailed,
        isAssessor, type,
      },
      hasPrevPage, isDisconnected, showSubmit, invalidSession,
    } = this.props

    const showSave = type === 'pass_assessment' && isAssessor
    const {
      popConfirmVisibleFor, nextButtonPressed, backButtonPressed, submitButtonPressed, saveButtonPressed,
    } = this.state
    const rtl = isRtl(I18n.uiLocale)
    const disableActionableButtons = isDisconnected || submissionInProgress || submissionFailed

    return (
      <>
        {submissionFailed
        && (
        <div>
          <Alert
            message={I18n.t('assessments.page.submissionFailedAlert.title')}
            description={I18n.t('assessments.page.submissionFailedAlert.description')}
            type="error"
            showIcon
          />
        </div>
        )
      }
        {invalidSession && (
          <div>
            <Alert
              message={I18n.t('assessments.page.invalid_session.title')}
              description={I18n.t('assessments.page.invalid_session.description')}
              type="error"
              showIcon
            />
          </div>
        )}
        <div className={cs(styles.footer, rtl ? 'rtl' : 'ltr')}>
          {enableBack && hasPrevPage && (
          <QuestionInProgressPopConfirm
            preview={preview}
            open={popConfirmVisibleFor === BACK}
            hidePopConfirm={this.hidePopConfirm}
            onConfirm={this.moveToPreviousPage}
          >
            <FixedWidthButton
              size="large"
              type="default"
              disabled={disableActionableButtons}
              loading={submissionInProgress && backButtonPressed}
              onClick={this.handlePreviousClick}
              className="mrs"
            >
              <span className="mrs mls fa fa-chevron-left rtl-flip" />
              { page.prevBtn || I18n.t('assessments.page.back', { locale: I18n.uiLocale }) }
            </FixedWidthButton>
          </QuestionInProgressPopConfirm>
          )}
          <QuestionInProgressPopConfirm
            preview={preview}
            open={popConfirmVisibleFor === NEXT}
            hidePopConfirm={this.hidePopConfirm}
            onConfirm={this.moveToNextPage}
          >
            {!showSubmit && showSave && (
              <FixedWidthButton
                size="large"
                type="primary"
                disabled={disableActionableButtons}
                loading={saveButtonPressed && submissionInProgress}
                className={styles.next}
                onClick={this.saveResults}
              >
                {I18n.t('assessments.page.save', { locale: I18n.uiLocale })}
              </FixedWidthButton>
            )}
            {showSubmit ? (
              <FixedWidthButton
                size="large"
                type="primary"
                disabled={disableActionableButtons}
                loading={submitButtonPressed && submissionInProgress}
                className={styles.next}
                onClick={() => this.handleNextClick(SUBMIT)}
              >
                {I18n.t('assessments.page.submit', { locale: I18n.uiLocale })}
              </FixedWidthButton>
            ) : (
              <FixedWidthButton
                size="large"
                type="primary"
                disabled={disableActionableButtons}
                loading={submissionInProgress && nextButtonPressed}
                onClick={() => this.handleNextClick(NEXT)}
                className={styles.next}
              >
                {page.nextBtn || I18n.t('assessments.page.next', { locale: I18n.uiLocale })}
                <span className="mls mrs fa fa-chevron-right rtl-flip" />
              </FixedWidthButton>
            )}
          </QuestionInProgressPopConfirm>
        </div>
      </>
    )
  }
}

function QuestionInProgressPopConfirm ({
  preview, preview: { inProgressQuestions }, open, hidePopConfirm, onConfirm, children,
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
      open={open && inProgressQuestions.length > 0}
      disabled={!inProgressQuestions.length}
      placement="topRight"
    >
      {children}
    </Popconfirm>
  )
}

export default PageFooter
