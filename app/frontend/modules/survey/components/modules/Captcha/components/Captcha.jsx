import { Component } from 'react'
import PropTypes from 'prop-types'
import TextEditor from '~/modules/survey/components/TextEditor'
import styles from './Captcha.less'
import Assets from '../assets'

export class Captcha extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeText = (value) => {
    const { model } = this.props
    model.changeProps({ questionText: value })
    this.forceUpdate()
  }

  render () {
    const { model, model: { props } } = this.props
    return (
      <div style={{ position: 'relative' }}>
        <div className={styles.questionText}>
          <TextEditor model={model} value={props.questionText} onChange={this.changeText} />
        </div>
        <img src={Assets.CaptchaMock} />
      </div>
    )
  }
}

export default Captcha
