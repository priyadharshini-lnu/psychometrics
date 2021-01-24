import React, { useEffect } from 'react'
import {
  browserName,
  browserVersion,
  osName,
  osVersion,
  getUA,
} from 'react-device-detect'

import styles from './MetaInfo.scss'

const { screen } = window

const MetaInfoPreview = ({ readOnly, model }) => {
  useEffect(() => {
    const answer = {
      browser: browserName,
      version: browserVersion,
      os: `${osName} ${osVersion}`,
      screen: `${screen.width}x${screen.height}`,
      userAgent: getUA,
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
