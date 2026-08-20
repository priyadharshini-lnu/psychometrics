import {
  Component, createRef, forwardRef,
  useEffect, useRef,
} from 'react'
import cs from 'classnames'
import {
  Popconfirm, Alert, message,
} from 'antd'
import { ExclamationCircleFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import { FixedWidthButton } from '~/glint'
import { isRtl } from '~/utils/locales'
import { supportEmail } from '~/utils/branding'
import { getQuestion } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import styles from './styles.less'
import { SafeHTML } from '~/components/SafeHTML'

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

  popUpContainerRef = createRef(null)

  popUpTriggerRef = createRef(null)

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

  handlePreviousClick = (e) => {
    this.popUpTriggerRef.current = e.target
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

  handleNextClick = (buttonType, e) => {
    this.popUpTriggerRef.current = e.target
    if (this.areQuestionsInProgress()) {
      this.setState({ popConfirmVisibleFor: NEXT })
    } else {
      this.moveToNextPage(buttonType)
    }
  }

  saveResults = (e) => {
    const { saveCurrentPage } = this.props
    this.popUpTriggerRef.current = e.target
    this.setState(prevState => ({
      ...prevState, nextButtonPressed: false, backButtonPressed: false, saveButtonPressed: true,
    }))
    saveCurrentPage().then(() => {
      message.success(I18n.t('frontend.saved_results'))
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
      hasPrevPage, isDisconnected, showSubmit, invalidSession, onSubmit, submitButtonText,
    } = this.props

    const showSave = type === 'pass_assessment' && (isAssessor || preview.options?.enable_save)

    const {
      popConfirmVisibleFor, nextButtonPressed, backButtonPressed, submitButtonPressed, saveButtonPressed,
    } = this.state
    const rtl = isRtl(I18n.uiLocale)
    const disableActionableButtons = isDisconnected || submissionInProgress || submissionFailed

    return (
      <div className={styles.overlay}>
        {submissionFailed
        && (
          <div>
            <Alert
              message={I18n.t('assessments.page.submissionFailedAlert.title')}
              description={(
                <SafeHTML
                  html={I18n.t('assessments.page.submissionFailedAlert.description', {
                    support_email: supportEmail(),
                  })}
                />
              )}
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
          <QuestionInProgressPopConfirm
            preview={preview}
            open={popConfirmVisibleFor === BACK || popConfirmVisibleFor === NEXT}
            hidePopConfirm={this.hidePopConfirm}
            onConfirm={popConfirmVisibleFor === BACK ? this.moveToPreviousPage : this.moveToNextPage}
            ref={this.popUpContainerRef}
            popUpTriggerRef={this.popUpTriggerRef}
          >
            {enableBack && hasPrevPage && (
              <FixedWidthButton
                size="large"
                type="default"
                disabled={disableActionableButtons}
                loading={submissionInProgress && backButtonPressed}
                onClick={e => this.handlePreviousClick(e)}
                className="mrs"
              >
                <span className="mrs mls fa fa-chevron-left rtl-flip" />
                { page.prevBtn || I18n.t('assessments.page.back', { locale: I18n.uiLocale }) }
              </FixedWidthButton>
            )}
            {!showSubmit && showSave && (
              <FixedWidthButton
                size="large"
                type="primary"
                disabled={disableActionableButtons}
                loading={saveButtonPressed && submissionInProgress}
                className={styles.next}
                onClick={e => this.saveResults(e)}
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
                onClick={(e) => {
                  this.handleNextClick(SUBMIT, e)
                  onSubmit && onSubmit()
                }}
              >
                {submitButtonText || I18n.t('assessments.page.submit', { locale: I18n.uiLocale })}
              </FixedWidthButton>
            ) : (
              <FixedWidthButton
                size="large"
                type="primary"
                disabled={disableActionableButtons}
                loading={submissionInProgress && nextButtonPressed}
                onClick={e => this.handleNextClick(NEXT, e)}
                className={styles.next}
              >
                {page.nextBtn || I18n.t('assessments.page.next', { locale: I18n.uiLocale })}
                <span className="mls mrs fa fa-chevron-right rtl-flip" />
              </FixedWidthButton>
            )}
          </QuestionInProgressPopConfirm>
          <div ref={this.popUpContainerRef} />
        </div>
      </div>
    )
  }
}

const QuestionInProgressPopConfirm = forwardRef(({
  preview, preview: { inProgressQuestions }, open,
  hidePopConfirm, onConfirm, children,
  popUpTriggerRef,
}, popUpContainerRef) => {
  const titleTextRef = useRef(null)

  useEffect(() => {
    const popUpContainerNode = popUpContainerRef?.current
    if (popUpContainerRef?.current && open) {
      popUpContainerNode.role = 'dialog'
      popUpContainerNode.ariaModal = 'false'
      popUpContainerNode.ariaLabel = I18n.t('frontend.aria.confirm_proceed')
    }
    if (titleTextRef?.current && open) {
      titleTextRef.current.focus()
    }
  }, [open])

  const popConfirmTitle = () => (
    <div>
      <b
        tabIndex={-1}
        ref={titleTextRef}
      >
        {I18n.t('validations.actions_still_in_progress', { locale: I18n.uiLocale })}
      </b>
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
      icon={<ExclamationCircleFilled aria-label={I18n.t('assessments.page.warning')} />}
      title={popConfirmTitle()}
      onConfirm={onConfirm}
      okText={I18n.t('assessments.proceed', { locale: I18n.uiLocale })}
      cancelText={I18n.t('assessments.wait', { locale: I18n.uiLocale })}
      onCancel={hidePopConfirm}
      open={open && inProgressQuestions.length > 0}
      disabled={!inProgressQuestions.length}
      placement="topRight"
      getPopupContainer={() => popUpContainerRef?.current || document.body}
      onOpenChange={(open) => {
        if (!open && popUpTriggerRef.current) {
          popUpTriggerRef.current.focus()
        }
      }}
    >
      {children}
    </Popconfirm>
  )
})

export default PageFooter
