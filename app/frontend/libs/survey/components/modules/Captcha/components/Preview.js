/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Recaptcha from 'react-google-recaptcha'
import I18nStore from 'store/I18nStore'
import styles from './Captcha.scss'

// TODO move to settings.yml
const SITE_KEY = '6Lf8uScTAAAAAAK5o5Zlf9iErXItnDqX70dLzMeO'
export class CaptchaPreview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  componentDidMount () {
    const { model, readOnly } = this.props
    if (readOnly) { return null }
    model.result.answer(false)
  }

  handleSuccess = () => {
    const { model } = this.props
    model.result.answer(true)
  }

  render () {
    const { model, readOnly } = this.props
    if (readOnly) { return null }
    return (
      <div>
        <div className={styles.questionText}>
          <div
            className={styles.questionTextPreview}
            dangerouslySetInnerHTML={{ __html: I18nStore.tQuestion(model, 'questionText') }}
          />
        </div>
        <Recaptcha
          sitekey={SITE_KEY}
          onChange={this.handleSuccess}
        />
      </div>
    )
  }
}

export default CaptchaPreview
