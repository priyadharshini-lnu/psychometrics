import { useEffect } from 'react'

import {
  BROWSER_NAME, BROWSER_VERSION, OS_NAME, OS_VERSION, UA_STRING,
} from '~/utils/uaParser'

import styles from './MetaInfo.less'

const { screen } = window

const MetaInfoPreview = ({ readOnly, model }) => {
  useEffect(() => {
    const answer = {
      browser: BROWSER_NAME,
      version: BROWSER_VERSION,
      os: `${OS_NAME} ${OS_VERSION}`,
      screen: `${screen.width}x${screen.height}`,
      userAgent: UA_STRING,
    }

    // answer is prototype function
    model.result.answer(answer)
  }, [])

  const {
    result: { answers },
  } = model

  if (readOnly) {
    return null
  }

  return (
    <div>
      <h4>Browser Meta Info</h4>
      <em>This question will not be displayed to the recipient.</em>
      <ul className={styles.ul}>
        <li>
          Browser:
          <b>{answers.browser}</b>
        </li>
        <li>
          Version:
          <b>{answers.version}</b>
        </li>
        <li>
          Operating System:
          <b>{answers.os}</b>
        </li>
        <li>
          Screen Resolution:
          <b>{answers.screen}</b>
        </li>
        <li>
          User Agent:
          <b>{answers.userAgent}</b>
        </li>
      </ul>
    </div>
  )
}

export default MetaInfoPreview
