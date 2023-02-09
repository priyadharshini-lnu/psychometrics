import PropTypes from 'prop-types'
import _ from 'lodash'
import { Alert } from 'antd'
import { connect } from 'react-redux'
import { getI18n } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import styles from './FileUpload.less'

function ErrorList ({
  errorCodes, errorMessages, errorProps, I18n,
}) {
  if (!_.isEmpty(errorCodes)) {
    errorMessages = (
      <ul className={styles.errorsList}>
        {errorCodes.map(errorCode => (
          <li key={errorCode}>{I18n.t(`validations.file_upload.${errorCode}`, errorProps)}</li>
        ))}
      </ul>
    )
  } else {
    errorMessages = <ul><li>{errorMessages}</li></ul>
  }

  return (
    <Alert message={errorMessages} type="error" className={styles.alert} />
  )
}

ErrorList.propTypes = {
  errorCodes: PropTypes.array,
  errorMessages: PropTypes.string,
  errorProps: PropTypes.object,
}

export default connect(({ preview }) => ({ I18n: getI18n(preview) }), {})(ErrorList)
