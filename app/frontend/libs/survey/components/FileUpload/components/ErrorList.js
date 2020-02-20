import React from 'react'
import I18nStore from 'store/I18nStore'
import PropTypes from 'prop-types'
import { Alert } from 'antd'
import styles from './FileUpload.scss'

export default function ErrorList ({ errorCodes, errorMessage, errorProps }) {
  let errorMessages = null
  if (!_.isEmpty(errorCodes)) {
    errorMessages = (
      <ul className={styles.errorsList}>
        {errorCodes.map(errorCode => (
          <li key={errorCode}>{I18nStore.t(`validations.file_upload.${errorCode}`, errorProps)}</li>
        ))}
      </ul>
    )
  } else {
    errorMessages = <ul><li>{errorMessage}</li></ul>
  }

  return (
    <Alert message={errorMessages} type="error" className={styles.alert} />
  )
}

ErrorList.propTypes = {
  errorCodes: PropTypes.array,
  errorMessage: PropTypes.string,
  errorProps: PropTypes.object,
}
