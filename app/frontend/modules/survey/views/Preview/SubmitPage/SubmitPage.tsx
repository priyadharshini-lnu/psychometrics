import React from 'react'
import cs from 'classnames'
import ReactMarkdown from 'react-markdown'
import styles from './styles.less'
import Footer from '../Page/components/PageFooter'
import { PropsFromRedux } from './connect'

const { I18n } = window

const SubmitPage: React.FC<PropsFromRedux> = ({
  page, nextPage, preview, prevPage, hasPrevPage, isDisconnected,
}) => (
  <div className={styles.page}>
    <div className={styles.question}>
      <ReactMarkdown className={cs(styles.message)}>{I18n.t('assessments.page.confirm_message')}</ReactMarkdown>
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

export default SubmitPage
