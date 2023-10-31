import React from 'react'
import cs from 'classnames'
import ReactMarkdown from 'react-markdown'
import styles from './styles.less'
import Footer from '../Page/components/PageFooter'
import { PropsFromRedux } from './connect'
import ScoringTable from '../EndPage/components/ScoringTable'

const { I18n } = window

const SubmitPage: React.FC<PropsFromRedux> = ({
  page, nextPage, preview, prevPage, hasPrevPage, isDisconnected, scoring, factors, dbResult,
  showScoringOnEndPage,
}) => {
  const { user_assessment_id } = dbResult

  return (
    <div className={styles.page}>
      <div className={styles.question}>
        <ReactMarkdown className={cs(styles.message)}>
          {I18n.t('assessments.page.confirm_message', { locale: I18n.uiLocale })}
        </ReactMarkdown>
        <ScoringTable
          showScoringOnEndPage={showScoringOnEndPage}
          scoring={scoring}
          factors={factors}
          I18n={I18n}
          userAssessmentId={user_assessment_id}
        />
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

export default SubmitPage
