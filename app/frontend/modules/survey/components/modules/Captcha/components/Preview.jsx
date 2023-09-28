import { Component } from 'react'
import PropTypes from 'prop-types'
import Recaptcha from 'react-google-recaptcha'
import { SafeHTML } from '~/components/SafeHTML'
import styles from './Captcha.less'
import connect from '../connect'

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
    const { model, readOnly, I18n } = this.props
    if (readOnly) { return null }
    return (
      <div>
        <div className={styles.questionText}>
          <SafeHTML
            html={I18n.tQuestion(model, 'questionText')}
            className={styles.questionTextPreview}
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

export default connect(CaptchaPreview)
